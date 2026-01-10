---
title: "When My Backend Stopped Being Code and Became a System #01"
date: "2025-11-26"
summary: "Real-world lessons from implementing a licensing platform: Stripe subscriptions, metadata-driven billing, JWT rotation, DB invariants, webhook reliability, and architectural mistakes that shaped me."
---
![When my backend became a system](/images/posts/backend-system-01.png)

> A technical debrief from building a real licensing platform — where databases enforce invariants, Stripe behaves like a distributed system, and identity becomes lifecycle design.

**This week, my backend stopped being “routes + controllers” and became a system:**

* **Identity lifecycle** (JWTs, refresh tokens, session rotation)
* **Subscriptions + licensing** (Stripe-driven product model)
* **Database invariants** (Aurora/MySQL enforcing rules instead of API “hope”)
* **Webhooks as events** (retries, delays, duplicates, out-of-order)
* **Tenant boundaries** (resource ownership across customers/domains)
* **Production reality** (EC2/PM2, raw bodies, reproducibility)

This post is what I built, what broke, what I fixed, and the mindset shift it forced.

---

## 1) The `updated_at` Column That Exposed a Design Smell

My first schema relied on the API to maintain timestamps.

```sql
CREATE TABLE domains (
  domain_sid   CHAR(36) NOT NULL UNIQUE,
  customer_sid CHAR(36) NOT NULL,
  domain_name  VARCHAR(256) NOT NULL UNIQUE,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NULL,
  PRIMARY KEY (domain_sid)
);
```

And the update path looked like:

```sql
UPDATE domains
SET domain_name = ?, updated_at = NOW()
WHERE domain_sid = ?;
```

Then my lead asked:

> “Can’t MySQL update this automatically?”

Translation: **why should application code enforce a database invariant?**

**Fixed schema invariant (database-owned):**

```sql
updated_at DATETIME NOT NULL
  DEFAULT CURRENT_TIMESTAMP
  ON UPDATE CURRENT_TIMESTAMP
```

**🔥 Takeaway**

* If the DB can enforce a rule, don’t re-implement it in application code.
* Schema is architecture — not a migration artifact.
* DB invariants remove entire classes of bugs.

---

## 2) Stripe Metadata: The Quiet Backbone of the Product Model

Metadata went from “extra fields” to **embedded domain model**.

Example: two products differentiated purely by metadata.

```yaml
id: prod_TQM3O9EBkzIFY6
name: self-host jambonz subscription - unlimited
metadata:
  product_family: self_hosted
  fee_structure: recurring
  usage_based: "false"
  air_gapped: "false"
```

```yaml
id: prod_TOlB8cP3VZeppE
name: self-host jambonz subscription - usage-based
metadata:
  product_family: self_hosted
  fee_structure: recurring
  usage_based: "true"
  air_gapped: "false"
```

**Metadata now drives:**

* Filtering products in the licensing UI
* Picking usage-based vs unlimited flows
* Ignoring irrelevant webhooks (other product families)
* Routing special cases (air-gapped → one-time licensing)

**🔥 Takeaway**

* Metadata isn’t decoration — it’s classification + behavior.
* Good metadata design simplifies both UI and backend logic.

---

## 3) Dynamic Pricing: Stripe Won’t Do the Math for You

Usage-based pricing arrived with **no `unit_amount`**.

Meaning: **Stripe charges what *you* compute.**

**Backend workflow:**

* Fetch tier definitions
* Compute charges on the server
* Return a preview to the UI
* UI displays: `USD $123.45 / month`

**🔥 Takeaway**

* Never bury pricing rules in the frontend.
* Server-side pricing is correctness + auditability.
* Stripe is a payment executor, not a pricing engine.

---

## 4) JWT & Sessions: From “Login Works” to Identity Lifecycle

My original mental model was basically:

```text
sign → verify → done
```

But real systems need lifecycle semantics.

### Access token

* **RS256**
* Short-lived (≈ 15 minutes)
* Contains: `sub`, `sid`, `email`

### Refresh token

* Random 48-byte value
* Hashed and stored in DB
* Bound to a single session/device
* Rotated on every refresh

### Sessions table (shape)

```text
session_sid (PK)
customer_sid
refresh_token_hash
refresh_expires_at
revoked_at
created_at
```

**🔥 Takeaway**

* Access tokens authenticate a **session**; refresh tokens authenticate a **device**.
* Rotation + hashing prevents replay.
* RS256 enables distributed verification without sharing secrets.

---

## 5) Stripe Webhooks: Events in a Distributed Universe

My old assumption:

> “Stripe hits `/webhook`, I handle it.”

Reality:

* Events can arrive late
* Or twice
* Or out of order
* Or for products you don’t care about
* Must be verified (signature)
* Must be **idempotent**

**Guardrail (metadata gate):**

```js
if (metadata.product_family !== "self_hosted") {
  // ignore
}
```

**System rules:**

* Store processed event IDs (idempotency)
* Wrap updates in DB transactions
* Accept retries safely

**🔥 Takeaway**

Webhooks behave like distributed messages — treat them as such.

---

## 6) Domain Ownership: Security in a Single Condition

Ownership rule:

```sql
SELECT domain_sid, customer_sid
FROM domains
WHERE domain_sid = ?;
```

Then:

```text
if domain.customer_sid !== currentCustomer → Forbidden
```

This one check prevents:

* Cross-tenant access
* Privilege escalation
* Accidental leakage

**🔥 Takeaway**

Every row is a boundary. Authorization is resource-level, not just login-level.

---

## 7) Deployment: When Node.js Becomes a Real Service on EC2

Deployment forced a mindset shift from “Node app” to “running service.”

**Production characteristics:**

* Fixed deploy path
* PM2 lifecycle management (restarts, memory caps)
* No `.env` — environment declared explicitly
* Stripe webhooks require raw body (no JSON parsing on that route)
* Aurora credentials + key management
* JWT keys stored securely on disk

**🔥 Takeaway**

Production = reproducibility + observability + predictability.

---

## 8) The Real Happy Path of Licensing

My first assumed flow:

```text
product → checkout → webhook → license
```

The real flow is a lifecycle:

1. Sign up
2. Verify email
3. Create Stripe customer
4. Create domain
5. Choose licensing model
6. Fetch products via metadata
7. Pricing preview (usage-based)
8. Checkout Session
9. Webhook generates license
10. UI displays license

**🔥 Takeaway**

UX drives the API contract. Once the lifecycle is clear, backend design becomes obvious.

---

## Closing Thoughts: From Code to System Thinking

If I had to summarize the week:

> I stopped writing endpoints and started designing systems.

**Mindset upgrades:**

* Schema is architecture.
* Metadata is a classification engine.
* JWTs are identity lifecycle.
* Webhooks are distributed events.
* Deployment defines behavior.
* Row-level ownership checks *are* the security model.
