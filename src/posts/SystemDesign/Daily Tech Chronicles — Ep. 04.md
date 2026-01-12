---

title: "When Stripe Card Errors Became 400s: Fixing a Leaky Contract Between Billing and UI"
date: "2026-01-12"
summary: "A recurring subscription endpoint started returning HTTP 400 on card failures that should have been recoverable UI flows. The root cause was a Stripe error happening earlier than I expected, before any PaymentIntent existed. I fixed it by aligning recurring with the one-time contract: always return a confirmable client_secret when the UI needs to continue."
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## 1. The moment the system surprised me

I expected card failures to be boring.

The frontend called `POST /stripe/subscription/start`. For one-time purchases, the endpoint always returned HTTP 200 with `status: "action_required"` and a `client_secret`. The UI then ran the Stripe confirm step and either succeeded or showed a Stripe-provided error like "Your card was declined" or "Your card's security code is incorrect."

For recurring subscriptions, I expected the same shape: either `success` (license created) or `action_required` (confirm in the UI), or `card_error` (retry), all delivered as HTTP 200 unless the request itself was invalid.

Instead, the server started doing this:

1. It logged `=== startSubscription API called ===` at `2026-01-07T22:47:20.717Z`.
2. It retrieved the recurring price.
3. It hit a Stripe error: `"Your card was declined."`
4. It logged `Failed to attach payment method`.
5. It returned HTTP 400 with `AppError("Failed to attach payment method")`.

The frontend saw:

```json
{
  "success": false,
  "error": { "message": "Failed to attach payment method" },
  "path": "/stripe/subscription/start",
  "timestamp": "2026-01-07T22:47:21.457Z"
}
```

That response was technically honest but operationally wrong. It turned a recoverable payment flow into a hard failure. No Stripe retry UI. No confirmation step. Just a dead end.

I sanitized all identifiers below. Domains, IDs, and secrets are placeholders.

## 2. What I thought was true (and why it was wrong)

I thought card errors only mattered after the subscription existed.

The mental model was:

1. Attach the PaymentMethod to the customer.
2. Set it as default.
3. Create the subscription.
4. Inspect `subscription.latest_invoice.payment_intent`.
5. Return `success`, `action_required`, or `card_error`.

That model worked often enough that I trusted it. The code even handled the post-create cases properly:

1. `requires_action` mapped to `status: "action_required"` with a `client_secret`.
2. `requires_payment_method` mapped to `status: "card_error"` with a `client_secret` (for retry).
3. A paid invoice mapped to `status: "success"` and triggered license creation immediately.

The problem is that Stripe can fail earlier than step 4. In my logs, it failed at step 1.

On `2026-01-08T16:32:21.204Z`, Stripe rejected a recurring flow at attach time:

1. `stripe_type: "StripeCardError"`
2. `stripe_code: "incorrect_cvc"`
3. `decline_code: "incorrect_cvc"`
4. `has_client_secret: false`

The API responded:

```json
{
  "status": "card_error",
  "subscription_id": null,
  "invoice_id": null,
  "payment_intent_id": null,
  "client_secret": null,
  "reason": "Your card's security code is incorrect."
}
```

That response was consistent with what happened: there was no PaymentIntent yet, so there was nothing to confirm.

But it did not match the contract I wanted: the UI path for these errors should still be driven by the Stripe confirm step, the same way one-time was.

The real mismatch was this:

1. One-time always creates a PaymentIntent first, so it always has a `client_secret`.
2. Recurring was attempting to attach the PaymentMethod before a PaymentIntent existed, so it sometimes had no `client_secret`.

I kept saying "I want action_required" because that is how the UI state machine was written. But for a wrong CVC or generic decline, Stripe does not mean "requires_action" in the SCA sense. Stripe means "the payment method is not valid for payment." That is `requires_payment_method`. The only reason one-time could still return `action_required` is that it always had a PaymentIntent and deferred error display to the confirm step.

That was the crux. I did not want Stripe semantics to leak into HTTP semantics or even into an early backend decision. I wanted a stable contract: if the UI needs a Stripe confirm step, return a `client_secret` and let Stripe tell the user why it failed.

## 3. The smallest reproducible example

I reduced the problem to two flows with the same endpoint.

### Flow A: One-time (works as desired)

Backend creates a PaymentIntent up front and returns a `client_secret` every time:

```ts
const pi = await stripe.paymentIntents.create({
  customer: customer.stripe_customer_id,
  amount,
  currency: price.currency,
  automatic_payment_methods: { enabled: true },
  metadata: {
    customer_sid,
    domain_sid,
    price_id: price.id,
    max_sessions: String(computedMaxSessions),
    fee_structure: 'onetime',
    air_gapped: 'true',
  },
});

return {
  status: 'action_required',
  subscription_id: null,
  invoice_id: null,
  payment_intent_id: pi.id,
  client_secret: pi.client_secret,
};
```

When the card is bad, Stripe emits webhook events like `payment_intent.payment_failed` and the UI sees the error during confirmation. That matched what I saw at `2026-01-08T16:33:28.230Z`.

### Flow B: Recurring (fails in a way the UI cannot recover from)

Recurring attempts to attach the PaymentMethod first:

```ts
try {
  paymentMethod = await stripe.paymentMethods.attach(payment_method_id, {
    customer: customer.stripe_customer_id,
  });
} catch (err) {
  const stripeErr = err as { code?: string };
  if (stripeErr.code !== 'resource_already_exists') {
    logger.error({ err, payment_method_id }, 'Failed to attach payment method');
    throw new AppError('Failed to attach payment method', 400);
  }
  paymentMethod = await stripe.paymentMethods.retrieve(payment_method_id);
}
```

With a declined card, the logs showed:

1. `"Your card was declined."`
2. `stripe_code: "card_declined"`
3. `decline_code: "generic_decline"`
4. `has_client_secret: false`

In that state, I could not produce a `client_secret` because I had not created an invoice PaymentIntent. The system had no confirmable artifact.

This was reproducible with test cards that simulate declines or incorrect CVC. The recurring flow hit the error at attach time, not later in `subscriptions.create`.

Assumption: Stripe test card behavior can differ depending on how the PaymentMethod is created and whether the confirm step happens client-side. I did not verify whether attach should ever validate CVC in the abstract. I only trusted the observed Stripe error and my logs.

## 4. The fix that worked (and the one that did not)

I tried two fixes.

### The fix that did not work: remapping attach failures to action_required

My first instinct was to treat every `StripeCardError` as recoverable and return `action_required` from the attach catch.

It produced this kind of response:

```json
{
  "status": "card_error",
  "subscription_id": null,
  "invoice_id": null,
  "payment_intent_id": null,
  "client_secret": null,
  "reason": "Your card was declined."
}
```

I could change the string `status` to `"action_required"`, but that would have been lying. The frontend needed a `client_secret`. The logs proved `has_client_secret: false`. Without creating an intent, nothing would change.

This was the key lesson: status labels do not create Stripe artifacts. Only Stripe API calls do.

### The fix that worked: always produce a PaymentIntent client_secret for recurring when the UI needs to confirm

I aligned recurring with one-time by ensuring the backend could always return a confirmable intent in the UI flow.

For subscriptions, that meant creating an incomplete subscription that expands the invoice PaymentIntent.

Here is the before vs after of the recurring subscription create call.

Before:

```ts
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  default_payment_method: payment_method_id,
  items: [{ price: price_id, quantity }],
  collection_method: 'charge_automatically',
  expand: ['latest_invoice.payment_intent'],
});
```

After:

```ts
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: price_id, quantity }],
  collection_method: 'charge_automatically',
  payment_behavior: 'default_incomplete',
  payment_settings: {
    payment_method_types: ['card'],
    save_default_payment_method: 'on_subscription',
  },
  expand: ['latest_invoice.payment_intent'],
});
```

That change did two things:

1. It guaranteed an invoice PaymentIntent exists for the initial payment attempt.
2. It guaranteed a `client_secret` is available when the subscription cannot be activated immediately.

Then I changed the attach error handling from "throw 400" to "create incomplete subscription and return its `client_secret`" for card errors.

This is the core snippet.

```ts
type ExpandedInvoice = Stripe.Invoice & { payment_intent?: Stripe.PaymentIntent | null };

const createIncompleteSubscriptionForClientSecret = async () => {
  const sub = await stripe.subscriptions.create({
    customer: customer.stripe_customer_id,
    items: [{ price: price_id, quantity }],
    collection_method: 'charge_automatically',
    payment_behavior: 'default_incomplete',
    payment_settings: { payment_method_types: ['card'] },
    expand: ['latest_invoice.payment_intent'],
    metadata: { customer_sid, domain_sid, price_id },
  });

  const latestInvoice = sub.latest_invoice as ExpandedInvoice | null;
  const pi = latestInvoice?.payment_intent ?? null;

  if (!pi?.client_secret) throw new AppError('Unable to create payment confirmation intent', 502);

  return {
    status: 'action_required' as const,
    subscription_id: sub.id,
    invoice_id: latestInvoice?.id ?? null,
    payment_intent_id: pi.id,
    client_secret: pi.client_secret,
  };
};

try {
  await stripe.paymentMethods.attach(payment_method_id, { customer: customer.stripe_customer_id });
} catch (e) {
  const stripeErr = e as { type?: string; code?: string; decline_code?: string; message?: string };
  const isCardError = stripeErr.type === 'StripeCardError' || typeof stripeErr.code === 'string';
  if (isCardError) {
    logger.warn({ payment_method_id, stripe_code: stripeErr.code }, 'Card error while attaching payment method');
    return await createIncompleteSubscriptionForClientSecret();
  }
  throw new AppError('Failed to attach payment method', 400);
}
```

With that, a decline no longer meant null secret. It meant: create the Stripe object the UI needs to finish the flow.

The UI contract became stable:

1. For recoverable payment issues, the response always contains `client_secret`.
2. For invalid requests, the response still uses HTTP 400.
3. For surprises, the response uses HTTP 502.

## 5. The deeper system design principle

This was not a Stripe bug. It was a contract bug.

I had conflated two layers:

1. Transport errors: malformed requests, unauthorized access, missing configuration.
2. Payment state: card declined, incorrect CVC, requires authentication, incomplete invoices.

The moment I threw `AppError(400)` for `StripeCardError`, I treated payment state as a client mistake. That is a bad boundary.

The UI does not care where in the backend flow the payment failed. It cares whether it can continue the Stripe confirmation flow or not.

The principle I extracted from this incident:

1. If the client can recover without changing the request shape, return HTTP 200 and a state machine status.
2. If the client must change the request shape or permissions, return 4xx.
3. If the backend cannot produce a Stripe artifact required for the next step, return 5xx with logs.

In practice, that means: do not throw 400 for card errors, and do not invent `action_required` unless you also provide a confirmable secret.

## 6. Tradeoffs I accepted on purpose

I made the recurring flow more like one-time. That came with costs.

Here is the tradeoff table I used to keep myself honest.

| Choice                                                        | What it fixes                                    | What it costs                                            | Failure mode                                       |
| ------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------- | -------------------------------------------------- |
| Throw 400 on attach failure                                   | Simple backend code path                         | UI cannot recover, loses Stripe error UX                 | Hard stop with generic error message               |
| Return card_error with null secret                            | Honest about missing PI                          | UI still cannot run confirm, inconsistent with one-time  | User sees server error text, not Stripe message    |
| Create `default_incomplete` subscription and return PI secret | Stable UI contract, Stripe drives error messages | Extra Stripe object creation, needs cleanup/retry policy | Potential accumulation of incomplete subscriptions |

I accepted the third option because the UI contract mattered more than Stripe object count. I also accepted that I might need follow-up work:

1. Ensure incomplete subscriptions are cancelled if the user abandons the flow.
2. Ensure webhook handling does not create licenses on incomplete payments.
3. Ensure we do not generate a license until `invoice.paid` conditions are met, which I already enforced for the success path.

Assumption: Stripe will not charge successfully without the client confirm step when `payment_behavior` is `default_incomplete`. That is the intended behavior, but I did not paste Stripe docs here because this post is grounded in the observed behavior and code changes.

## 7. Mistakes and course corrections

1. Mistake: I treated a Stripe card error as a bad request.

   Evidence: `2026-01-07T22:47:21.457Z` ended as HTTP 400 with message "Failed to attach payment method". The logs showed a genuine card decline, not a malformed request. I changed the mapping so card errors return HTTP 200 with a recoverable status.

2. Mistake: I assumed `action_required` is the right status for wrong CVC.

   Evidence: Stripe returned `stripe_code: "incorrect_cvc"` and no `client_secret` at attach time. That is not SCA. My desire for `action_required` was a UI contract desire, not Stripe semantics. The course correction was to make the backend always return a `client_secret` by creating an incomplete subscription, so the UI confirm step could surface the correct error without me mislabeling it.

3. Mistake: I overfit the recurring flow to the "post subscription create" branches.

   Evidence: I had logic for `requires_payment_method` and `requires_action` after `subscriptions.create`, but my failures never reached that point. The course correction was to treat "where it fails" as an implementation detail and design the response contract around "what the UI needs next."

## 8. Operational checklist

1. Confirm the endpoint returns HTTP 200 for payment-state failures and HTTP 4xx only for request validation and authorization.
2. Log Stripe error fields `type`, `code`, `decline_code` and whether a `client_secret` exists, but never log the secret itself.
3. Ensure recurring uses `payment_behavior: 'default_incomplete'` and expands `latest_invoice.payment_intent`.
4. Ensure the response includes `payment_intent_id` and `client_secret` whenever `status` indicates the UI must confirm.
5. Ensure license creation only happens when `subscription.status === 'active'` and `latest_invoice.status === 'paid'` and PaymentIntent is succeeded or absent.
6. Add a cleanup policy for abandoned incomplete subscriptions, either by webhook or scheduled job, and confirm it does not delete valid active subscriptions.
7. Verify the frontend confirm step uses the correct Stripe API for PaymentIntent secrets from subscriptions.
8. Test with at least two Stripe test scenarios: incorrect CVC and generic decline, and confirm the UI shows Stripe messages rather than server messages.
9. Verify that promo code metadata and discount application still show up in subscription metadata in Stripe and do not change the payment intent creation behavior.

## 9. Key learnings

1. A stable contract beats a correct internal flow. The UI needs artifacts, not explanations.
2. Payment state is not a bad request. Mapping it to HTTP 400 creates dead ends.
3. You cannot return `action_required` without a `client_secret` and call it a day.
4. The place where Stripe fails can shift. Contract design should not depend on the failure location.
5. For subscriptions, `default_incomplete` is the tool that makes recurring behave like one-time when the UI owns confirmation.
6. Logs should show Stripe codes and intent presence, not secrets. Debugging depends on those fields.
7. If you create more Stripe objects to stabilize UX, you owe the system a cleanup plan.
