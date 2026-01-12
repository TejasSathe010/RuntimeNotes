---

title: "My Billing History Lied to Me: Refunds That Never Existed in Invoices"
date: "2026-01-12"
summary: "I tried to show refunds in a billing history view by listing invoices. Stripe kept returning paid invoices and my UI kept saying Subscription creation. The real source of truth was the charge, not the invoice, and my first fix failed because of an expand depth limit and a subtle product id extraction bug."
--------------------------------------------------------------

## 1. The moment the system surprised me

I was building a billing history page. The database already stored subscription metadata like payment method last4, receipt_url, and a stripe_subscription_id. It felt like I was one API call away from showing a clean table of invoice rows.

Then I refunded a customer in Stripe. The Stripe dashboard clearly showed the refund right next to the payment. My backend still returned a normal paid invoice.

The log line that made me stop trusting my mental model was not from Stripe. It was from our own server. I shipped a change that switched to a charges based history, and the server crashed immediately:

`Error: You cannot expand more than 4 levels of a property. Property: data.invoice.lines.data.price`

I had built a billing history endpoint that could not even run, and the reason was that I tried to expand my way to the truth.

## 2. What I thought was true (and why it was wrong)

I thought refunds would show up as their own invoice-like objects.

That is not how Stripe models it. In my test, the lead dev ran the simplest check:

1. List charges for a customer.
2. Refund the subscription.
3. List charges again.

The same charge id showed both the payment and the refund state. The second query returned one charge, now marked `refunded=true` with `amount_refunded` populated.

That single observation reframed the whole problem: invoices are not the canonical timeline for refunds. The charge is.

I also thought I could just expand invoice lines from charges and reuse my old invoice summarization logic.

That failed in production because Stripe enforces an expand depth limit. I did not notice because my previous implementation listed invoices directly and expanded lines from the invoice list endpoint, which has a shallower path.

## 3. The smallest reproducible example

The database table that started this thread was a local record of subscription info:

```sql
CREATE TABLE stripe_subscriptions
(
  stripe_subscription_sid CHAR(36) NOT NULL UNIQUE,
  license_sid CHAR(36) NOT NULL,
  stripe_subscription_id VARCHAR(56),
  stripe_payment_method_id VARCHAR(56),
  stripe_statement_descriptor VARCHAR(255),
  last4 VARCHAR(512),
  exp_month INTEGER,
  exp_year INTEGER,
  card_type VARCHAR(16),
  receipt_url VARCHAR(512),
  pending_reason VARBINARY(52),
  pending BOOLEAN NOT NULL DEFAULT false,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (stripe_subscription_sid)
);
```

That table is useful for subscription state, but it cannot answer a timeline question like "show every payment and refund" because refunds are not stored there.

The reproducible Stripe behavior came from a direct API call that the lead dev ran in a terminal. This is sanitized, but the fields are the key:

```bash
curl -s "https://api.stripe.com/v1/charges?customer=cus_XXXX&limit=20" \
  -u sk_test_XXXX: | jq '.data[] | {id, amount, status, refunded, amount_refunded, created}'
```

Before refund:

```json
{
  "id": "ch_XXXX",
  "amount": 35000,
  "status": "succeeded",
  "refunded": false,
  "amount_refunded": 0,
  "created": 1766528657
}
```

After refund:

```json
{
  "id": "ch_XXXX",
  "amount": 35000,
  "status": "succeeded",
  "refunded": true,
  "amount_refunded": 35000,
  "created": 1766528657
}
```

The important part is what did not change. The charge id stayed the same. There was no second payment object. The refund lives as state and as refund objects hanging off the same charge.

## 4. The fix that worked (and the one that did not)

The first fix I tried was the obvious one: list charges and expand everything I needed so I could reuse my invoice summary text.

It died at runtime.

### The one that did not work

This expand list is the exact mistake. It tries to pull invoice lines and price objects in one call:

```ts
await stripe.charges.list({
  customer: customerId,
  limit,
  expand: [
    "data.invoice",
    "data.invoice.lines.data.price",
    "data.refunds",
  ],
});
```

The server error from our logs was clear:

1. It happened during `GET /account/billing-history?limit=50`.
2. It returned 500.
3. Stripe rejected the expand path because it exceeded the nesting limit.

That was my first correction: stop trying to force Stripe to return a fully hydrated invoice graph through the charges list endpoint.

### The fix that worked

I split the problem into two phases:

1. Page through charges. Expand only shallow objects that fit the depth limit.
2. Hydrate invoice details separately per invoice id, but in batches.

The charges list call stayed shallow:

```ts
await stripe.charges.list({
  customer: customerId,
  limit,
  starting_after: cursor,
  expand: [
    "data.invoice",
    "data.refunds",
  ],
});
```

Then I fetched invoice line details with `invoices.retrieve`, which can safely expand `lines.data.price` and `lines.data.plan` without exceeding the depth limit.

I still had one more bug after that. The refund rows and payment rows kept showing `Subscription creation` as the reason. That was a reason bug, not a refunds bug.

The root cause was a mismatch between expanded objects and my own extraction logic. If Stripe returns `price.product` as an expanded object, my old product id extraction only collected strings. That meant my productName cache never got a product id, so summarization fell back to `line.description`, which was `Subscription creation`.

The fix was to expand product in invoice hydration and to make product id extraction accept both string ids and expanded products.

## 5. The deeper system design principle

This episode reinforced one principle I keep relearning: pick the real system of record for the question you are answering.

A billing timeline is not "all invoices". It is "all money movements". In Stripe, money movement is charge and refund, not invoice status.

That is why the lead dev’s terminal test was more valuable than my UI screenshots. It showed the contract in one line:

`refunded=true` and `amount_refunded>0` on the charge.

Everything else is presentation.

Once I accepted that, the rest of the design followed:

1. Charges are the index of history.
2. Invoices are optional metadata for human readable labels.
3. Refunds are separate entries, even if the charge also flips state.

## 6. Tradeoffs I accepted on purpose

I made a few explicit tradeoffs to keep the endpoint maintainable and fast enough.

| Choice                                                          | What I gained                                            | What I gave up                        | Failure mode I watched                              |
| --------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------- | --------------------------------------------------- |
| Charges first timeline                                          | Refunds always visible via charge state and refunds list | Some payments may not have an invoice | Reason may degrade to charge.description            |
| Hydrate invoices separately                                     | Avoid expand depth limit                                 | Extra API calls per page              | API rate limits if batching is sloppy               |
| Keep payment row status as paid, show refunded amount as a note | Cleaner ledger UX and consistent sorting                 | Stripe dashboard style is different   | Users might expect "Refunded" status on payment row |
| Cache billing page for 2 minutes                                | Lower Stripe load during refresh spam                    | Stale reason text after deploy        | Debug confusion unless cache key is bumped          |

I also accepted that the "reason" string is best effort. If a charge has no invoice attached, I fall back to the charge description. That can still be `Subscription creation`. I can live with that, because it is truthful, and I can improve it later by using metadata at charge creation time.

## 7. Mistakes and course corrections

1. I tried to expand too deep in one Stripe call.

   1. Mistake: I used `data.invoice.lines.data.price` on `charges.list`.
   2. Outcome: 500s in production with an explicit Stripe API error.
   3. Change: shallow expand on charges, hydrate invoice lines via `invoices.retrieve`.

2. I netted the payment amount and also emitted refund rows.

   1. Mistake: I had logic like `net = gross - refunded` for the payment row while also adding negative refund rows.
   2. Outcome: double counting refunds in the UI.
   3. Change: keep payment row as gross amount, emit refunds as separate negative rows, show refunded amount as a note only.

3. I broke the reason text by assuming product ids were always strings.

   1. Mistake: `extractProductIdsFromInvoices` only handled `typeof product === "string"`.
   2. Outcome: reason fell back to `Subscription creation` even when the product existed.
   3. Change: expand `lines.data.price.product` and treat product id as either a string or an expanded object.

Before vs after, reason only, the exact missing bit:

```ts
// Before: product ids collected only if the field is a string
const p = line.price?.product;
if (typeof p === "string") ids.add(p);
```

```ts
// After: accept either a string id or an expanded Product object
const p = line.price?.product as unknown;
if (typeof p === "string") ids.add(p);
else if (p && typeof (p as any).id === "string") ids.add((p as any).id);
```

## 8. Operational checklist

1. Confirm the timeline source.

   1. Run a charges list call for a test customer.
   2. Refund a payment.
   3. Verify the same charge has `amount_refunded > 0`.

2. Verify Stripe expand depth is safe.

   1. Keep `charges.list` expands shallow.
   2. Hydrate invoices separately with `invoices.retrieve`.

3. Verify reason text generation.

   1. Ensure invoice hydration expands `lines.data.price` and `lines.data.plan`.
   2. If you want product names without extra calls, expand `lines.data.price.product` and `lines.data.plan.product`.
   3. Ensure product id extraction handles both string ids and expanded objects.

4. Verify refund rows.

   1. For each refunded charge, list refunds off the charge.
   2. Emit negative refund rows for each succeeded refund.

5. Verify you are not double counting.

   1. Payment row amount should be gross.
   2. Refund rows should be negative.
   3. Payment row can carry `refunded_cents` for display only.

6. Verify cache behavior during debugging.

   1. Bump the cache key version when changing reason logic.
   2. Clear productName cache when adjusting product extraction logic.

## 9. Key learnings

1. A billing history is a money movement timeline, not an invoice list.
2. Stripe refunds are charge state plus refund objects, not a separate invoice record.
3. Expand limits are a real production constraint, not a docs footnote.
4. Splitting one complex request into two simpler requests can be the fastest path to correctness.
5. If you hydrate objects, you must update your extraction code to handle expanded shapes.
6. Caching can hide fixes and create false negatives during debugging.
7. Ledger style UI gets simpler when payments stay paid and refunds become explicit rows.
