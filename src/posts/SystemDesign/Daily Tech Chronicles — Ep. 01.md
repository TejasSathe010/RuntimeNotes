---
title: "When My Backend Stopped Being Code and Became a System - #01"
date: "2025-11-26"
summary: "Real-world lessons from implementing a licensing platform: Stripe subscriptions, metadata-driven billing, JWT rotation, DB invariants, webhook reliability, and architectural mistakes that shaped me."
---

# 🚀 When My Backend Stopped Being Code and Became a System

> This is not a generic blog. This is a developer growing up in public, learning how real systems behave, how Stripe thinks, how databases enforce invariants, and how small architectural decisions snowball.

Somewhere this week, my backend stopped being “just routes and controllers.”

It became:

* Identity lifecycle (JWTs, refresh tokens, session rotation)
* Subscription and licensing logic powered by Stripe
* Aurora-level invariants instead of API-level “hope”
* Webhooks behaving like distributed events (retries, delays, duplicates)
* Resource ownership boundaries across tenants and domains
* A service that actually lives on EC2, not localhost

This is my honest technical debrief: what I built, what broke, what I fixed, and how it changed the way I write backend systems.

---

## 🧱 1. The 'updated_at' Column That Exposed a Design Smell

**Initial schema relied on the API to maintain timestamps:**

```

CREATE TABLE domains (
domain_sid   CHAR(36) NOT NULL UNIQUE,
customer_sid CHAR(36) NOT NULL,
domain_name  VARCHAR(256) NOT NULL UNIQUE,
created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at   DATETIME NULL,
PRIMARY KEY (domain_sid)
);

```

**And the update logic looked like this:**

```

UPDATE domains
SET domain_name = ?, updated_at = NOW()
WHERE domain_sid = ?;

```

Then my lead asked:

> “Can’t MySQL update this automatically?”

Translation: *why should the API enforce a DB invariant?*

**Correct schema with built-in invariant:**

```

updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
ON UPDATE CURRENT_TIMESTAMP

```

Now the database, not the API, owns the rule.

🔥 Takeaway

* If the DB can enforce a rule, don’t re-implement it in application code.
* Schema design is part of system architecture.
* DB invariants eliminate whole classes of bugs.

---

## 🧬 2. Stripe Metadata: The Quiet Backbone of the Product Model

Metadata went from “extra fields” to “the brain of the product catalog.”

Example: Two Stripe products

```

id: prod_TQM3O9EBkzIFY6
name: self-host jambonz subscription - unlimited
metadata:
product_family: self_hosted
fee_structure: recurring
usage_based: false
air_gapped: false

```
```

id: prod_TOlB8cP3VZeppE
name: self-host jambonz subscription - usage-based
metadata:
product_family: self_hosted
fee_structure: recurring
usage_based: true
air_gapped: false

```

**Metadata now powers:**

* Filtering in the licensing UI
* Choosing between usage-based vs. unlimited billing
* Ignoring webhooks for other product families
* Routing flows (for example, air-gapped to one-time license)

🔥 Takeaway

* Metadata is not decoration; it is your embedded domain model inside Stripe.
* Good metadata design drastically simplifies your backend logic.

---

## 🧮 3. Dynamic Pricing: Stripe Won’t Do the Math for You
Usage-based pricing came with no unit_amount field.

Meaning: **Stripe charges what *you* calculate.**

### Backend workflow

* Fetch price tiers
* Compute charges server-side
* Return preview to UI
* UI displays: *USD $123.45 / month*

You own the pricing engine; Stripe just executes the charge.

 🔥 Takeaway

* Never bury pricing rules in the frontend.
* Server-side calculations ensure correctness and auditability.
* Stripe is a payment processor, not a pricing system.

---

## 🔐 4. JWT & Sessions: From “Login Works” to Identity Lifecycle

My original model was essentially:

```

sign → verify → done

```

But real systems need:

### Access Token

* Algorithm: **RS256**
* Short-lived (15 min)
* Contains: sub, sid, email

### Refresh Token

* Random 48-byte value
* Hashed and stored in DB
* Bound to a single session/device
* Rotated on every refresh

### Sessions table

```

session_sid (PK)
customer_sid
refresh_token_hash
refresh_expires_at
revoked_at
created_at

```

🔥 Takeaway

* Access tokens authenticate a **session**; refresh tokens authenticate a **device**.
* Rotation + hashing prevents replay attacks.
* RS256 allows distributed verification without sharing secrets.

---

## 📬 5. Stripe Webhooks: Events in a Distributed Universe

My old assumption:

> “Stripe hits /webhook, I handle it.”

Reality:

* Webhooks can arrive late
* Or twice
* Or out of order
* Or for other products
* Must be cryptographically verified
* Must be **idempotent**

### Guardrail using metadata

```

if metadata.product_family !== 'self_hosted':
ignore event

```

### System rules

* Store processed event IDs
* Wrap subscription/license updates in DB transactions
* Accept retries safely

🔥 Takeaway

Webhooks act like messages in a distributed system; treat them as such.

---

## 🧱 6. Domain Ownership: Security in a Single Condition

Ownership rule:

```

SELECT domain_sid, customer_sid
FROM domains
WHERE domain_sid = ?;

```

Then:

```

if domain.customer_sid !== currentCustomer:
Forbidden

```

This simple check prevents:

* Cross-tenant access
* Privilege escalation
* Accidental leakage

🔥 Takeaway

Every row is a security boundary. Authorization lives at the resource level, not just at login.

---

## 🌐 7. Deployment: When Node.js Becomes a Real Service on EC2

Deployment shifted my thinking from “Node app” to “running service.”

### Production characteristics

* Code lives at a fixed directory path
* PM2 manages lifecycle, restarts, memory limits
* No .env files; environment is declared explicitly
* Stripe webhook expects raw body; JSON parsing disabled
* Aurora DB plus proper credentials
* JWT keys live in secure filesystem paths

🔥 Takeaway

Production = reproducibility + observability + predictability.

---

## 🧩 8. The Real Happy Path of Licensing

My first assumed flow was:  
**product → checkout → webhook → license**

The real flow is a **full lifecycle**:

1. Sign up
2. Verify email
3. Create Stripe customer
4. Create domain
5. Choose licensing model
6. Fetch Stripe products via metadata
7. Pricing preview (usage-based)
8. Checkout Session
9. Webhook generates license
10. UI displays license

🔥 Takeaway

UX drives API contract design, not the other way around.  
Once the lifecycle is clear, the backend design becomes obvious.

---

# 🎯 Closing Thoughts - From Code to System Thinking

If I had to summarize the week in one sentence:

> I stopped writing endpoints and started designing systems.

### Mindset Upgrades

* Schema is part of architecture, not a migration artifact
* Metadata is a classification engine
* JWTs are part of identity lifecycle, not “login”
* Webhooks are distributed system events
* Deployment defines behavior, not just code
* Row-level ownership checks *are* the security model

This week felt like the shift from “writing Node apps” to actually being an **engineer**.
