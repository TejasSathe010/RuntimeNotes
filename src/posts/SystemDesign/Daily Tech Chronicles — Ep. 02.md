---
title: "When updated_at Stopped Being My Problem - RuntimeNotes #02"
date: "2025-12-03"
summary: "How a review comment about updated_at pushed me from CRUD thinking to database-enforced invariants, moving time, ownership, and integrity out of Node.js and into the schema where they belong."
---

There is a specific line of SQL that made me feel embarrassingly junior:

```sql
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

It showed up right after a review comment from my lead:

> “Isn’t there a way to have a default automatically update this column value on updates? Please research this.”

I had just “finished” implementing a **domain-update API** for a licensing backend. It worked. It was tested. It logged nicely.

And it was wrong.

This post is about *why* it was wrong, and the deeper system-design lesson underneath:

> **Your application should not be the last line of defense for invariants the database can enforce better.**

We’ll zoom in on one very concrete thing:

* **Owning `updated_at` at the database layer instead of in Node.js**

Then we’ll push it further into a general pattern you can reuse in every backend you build.

---

## 1. The innocent update that smelled “fine”

I started with a pretty standard 'domains' table:

```sql
CREATE TABLE domains (
  domain_sid CHAR(36) NOT NULL UNIQUE,
  customer_sid CHAR(36) NOT NULL,
  domain_name VARCHAR(256) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  PRIMARY KEY (domain_sid)
);
```

And the update service in Node.js:

```js
export async function updateDomain(domainSid, newDomainName, customerSid) {
  if (!newDomainName) {
    throw new AppError('New domain name is required', 400);
  }

  newDomainName = newDomainName.trim().toLowerCase();

  const [domain] = await query(
    'SELECT domain_sid, customer_sid FROM domains WHERE domain_sid=? LIMIT 1',
    [domainSid]
  );

  if (!domain) throw new AppError('Domain not found', 404);
  if (domain.customer_sid !== customerSid) {
    throw new AppError('Forbidden: Domain does not belong to you', 403);
  }

  const nameTaken = await query(
    'SELECT domain_sid FROM domains WHERE domain_name=? LIMIT 1',
    [newDomainName]
  );

  if (nameTaken.length) {
    throw new AppError('Domain name already taken', 409);
  }

  await query(
    'UPDATE domains SET domain_name=?, updated_at=NOW() WHERE domain_sid=?',
    [newDomainName, domainSid]
  );

  return { domain_sid: domainSid, domain_name: newDomainName };
}
```

It:

* Validates input
* Checks ownership
* Enforces unique domain name
* Updates `updated_at` in the same query

If you’re used to REST backends, this is “fine.”

My lead looked at it and immediately zoomed in on:

```sql
updated_at=NOW()
```

…and shot the question:

> “Isn’t there a way to have a default automatically update this column value on updates?”

That question is exactly the transition point from **“I’m writing endpoints”** to **“I’m designing a system.”**

---

## 2. Who owns time in your system?

`updated_at` is not a *business rule* of the domain update API.

It is a **system invariant**:

* “Whenever any row in this table changes, I want to know when that happened.”

That invariant is not specific to:

* HTTP
* Node.js
* A single service

It’s a property of the **data itself**.

So the real question is:

> *Where is the single source of truth that says:
> “This row changed at time T” ?*

If it lives in your Node.js service:

* Every other writer (migration script, admin tool, some future service) must remember to set `updated_at` too
* Any missed path silently breaks your invariants
* You’ve made correctness dependent on discipline instead of design

If it lives in the database:

* Every write path, regardless of which codebase it comes from, plays by the same rule
* “Forgetfulness” is impossible; you literally cannot update the row without time moving forward

That’s the shift: **make the database the owner of time.**

---

## 3. The schema you *actually* want

Instead of:

```sql
updated_at DATETIME NULL,
```

you want:

```sql
updated_at DATETIME
  DEFAULT CURRENT_TIMESTAMP
  ON UPDATE CURRENT_TIMESTAMP
```

So the full table becomes:

```sql
CREATE TABLE domains (
  domain_sid CHAR(36) NOT NULL UNIQUE,
  customer_sid CHAR(36) NOT NULL,
  domain_name VARCHAR(256) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (domain_sid),
  CONSTRAINT fk_domains_customer
    FOREIGN KEY (customer_sid) REFERENCES customers(customer_sid)
);
```

This does two powerful things:

1. **On insert**

   * `created_at` = now
   * `updated_at` = now
     No application code involved.

2. **On any update to the row**

   * `updated_at` automatically becomes “now”
     Even if the update comes from:
   * a future microservice
   * an ad-hoc migration
   * a manual admin SQL script
   * a repair tool

You’ve embedded temporal correctness into the storage engine itself.

Now your Node.js becomes:

```js
await query(
  'UPDATE domains SET domain_name=? WHERE domain_sid=?',
  [newDomainName, domainSid]
);
```

And `updated_at` “just works” everywhere.

---

## 4. Why this small change is actually big system design

This wasn’t “just” about one field. It forced me to generalize a rule:

> **Any invariant that is true for the data, regardless of who writes it,
> belongs in the database, not in application code.**

Let’s look at the other parts of the licensing system where this applies.

### 4.1. Uniqueness: “A domain name must be unique”

Bad version:

* You check in Node: “does this domain_name exist?”
* You decide “no”
* You insert
* Two concurrent requests slip in → now you have duplicates

Proper version:

```sql
domain_name VARCHAR(256) NOT NULL UNIQUE
```

Plus in Node.js:

* You *still* do the pre-check for a nicer error message
* But the real enforcement is the `UNIQUE` constraint
* If a race condition happens, the DB throws `ER_DUP_ENTRY`
* You catch it and map it to `409 Conflict`

Application: **soft validation**
Database: **hard guarantee**

### 4.2. Ownership: “A license must belong to exactly one domain”

The licensing backend has:

```sql
CREATE TABLE licenses (
  license_sid CHAR(36) NOT NULL UNIQUE,
  domain_sid CHAR(36) NOT NULL,
  -- ...
  PRIMARY KEY (license_sid)
);

ALTER TABLE licenses
  ADD CONSTRAINT fk_licenses_domain
  FOREIGN KEY (domain_sid) REFERENCES domains(domain_sid);
```

What does that give you?

* You literally cannot insert a license for a non-existent domain
* You cannot delete a domain that still has an attached license if you choose `ON DELETE RESTRICT`
* Your application logic doesn’t need to remember “check that domain exists” every time

The **ownership graph** lives in SQL, not in if-statements scattered across services.

### 4.3. Session & refresh-token rotation

You added a `sessions` table to support refresh-token rotation:

```sql
CREATE TABLE sessions (
  session_sid CHAR(36) NOT NULL UNIQUE,
  customer_sid CHAR(36) NOT NULL,
  refresh_token_hash CHAR(64) NOT NULL,
  refresh_expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (session_sid),
  CONSTRAINT fk_sessions_customer
    FOREIGN KEY (customer_sid) REFERENCES customers(customer_sid)
);
```

Now, the system-level guarantees are:

* A session is always tied to a real customer (`FOREIGN KEY`)
* Every token has explicit temporal bounds (`refresh_expires_at`)
* You can do queries like:

  ```sql
  SELECT * FROM sessions
   WHERE customer_sid = ?
     AND revoked_at IS NULL
     AND refresh_expires_at > NOW();
  ```

That’s not “just data.”
That’s an enforceable contract about how refresh tokens exist in your system.

Again, the pattern:

* Make the **DB** express what’s structurally true
* Make **Node** express what’s procedurally allowed

---

## 5. Stripe, metadata, and the “thin-waist” of your system

The same idea of “right layer, right responsibility” applies to how you glued Stripe into this.

You ended up with products that look like:

```json
{
  "id": "prod_TOlB8cP3VZeppE",
  "name": "Self-hosted subscription - usage based",
  "metadata": {
    "product_family": "self_hosted",
    "fee_structure": "recurring",
    "usage_based": "true",
    "air_gapped": "false"
  }
}
```

You could have hardcoded logic like:

```js
if (product.id === 'prod_TOlB8cP3VZeppE') { /* usage-based logic */ }
```

Instead, you did something much smarter:

* You treat **Stripe metadata as a contract**, not as “comments”
* Your backend filters products by `product_family=self_hosted`
* Differentiates behavior by `usage_based` & `fee_structure`
* Ignores webhooks where `product_family` does not match your universe

This is the same move as with `updated_at`:

* Don’t spread identity and classification logic over random codepaths
* Let the **data** itself carry the classification
* Write generic logic around it

Now, adding a new product is mostly:

* Set the right metadata in Stripe
* Your backend logic keeps working without `if (id === 'prod_...')`

Again: **the contract lives as close to the source-of-truth data as possible.**

---

## 6. A mental checklist I now apply to every table

For every table I design now, I literally run this checklist:

1. **Time**

   * Do I need both `created_at` and `updated_at`?
   * Can I declare:

     ```sql
     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
     ```
   * Are there business events that deserve their own timestamps?
     (`activated_at`, `deactivated_at`, `paid_at`, etc.)

2. **Identity**

   * What is the **true** primary key? (`*_sid` vs natural key)
   * Which columns must be globally or scoped-unique?
     (`email`, `domain_name`, `(customer_id, domain_name)`)

3. **Ownership / Graph**

   * What does this row “belong to”?
     → add a `FOREIGN KEY`
   * Do I want `ON DELETE RESTRICT` or `ON DELETE CASCADE`?

4. **Integrity at rest**

   * Are there any invariants I’m enforcing only in code that could be `CHECK` constraints, `NOT NULL`, `ENUM`?

5. **Access patterns**

   * Do I have indexes that match my most critical WHERE clauses?

Only *after* I’m happy with those do I allow myself to write the first line of Node.js for that feature.

---

## 7. The before/after mindset

**Before:**

* “I’ve added `updated_at` and I make sure to set it in the update function. Done.”
* “The service validates uniqueness, so we’re good.”
* “We can always add constraints later if needed.”

**After:**

* “If this invariant should hold regardless of which service is writing, it belongs in the database schema.”
* “If I can break the system’s invariants with a single `UPDATE` in a SQL console, I haven’t finished designing it.”
* “My Node.js code should express behavior, not simulate constraints the DB is capable of guaranteeing.”

The small comment about `updated_at` wasn’t about timestamps.
It was about **moving from “making it work” to “making it unbreakable by construction.”**

---

## 8. What to steal from this for your own systems

Next time you:

* Add `updated_at`
* Add ownership (`user_id`, `account_id`, `domain_id`)
* Add something like `status`, `type`, `license_type`, `fee_structure`

Ask one question:

> “If someone wrote directly to this table from another codebase,
> could they accidentally break my system’s assumptions?”

If the answer is “yes,” the fix probably isn’t another if-statement in your controller.
It’s a schema change.

And sometimes, the most “senior” thing you can push in a PR isn’t clever code.
It’s a boring line of SQL like:

```sql
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
```

That’s the kind of boring that keeps systems alive.
