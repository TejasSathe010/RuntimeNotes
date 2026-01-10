---

title: "The 99% Accurate Model That Failed in a Week — RuntimeNotes #03"
date: "2026-01-04"
summary: "I shipped a model that looked flawless in a notebook and collapsed in production. The root cause wasn’t ‘bad ML’, it was a system invariant I violated: causality. This is the practical story of feature leakage, time-aware evaluation, and the system design patterns that turn a model into a dependable service."
---

There’s a line of Python I have typed a thousand times that now makes me cringe a little:

```py
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
```

Not because `train_test_split` is bad.

But because the day I shipped my “99% accurate” model, **that line quietly told my model the future**.

And the future is a cheat code.

A week after deployment, I was staring at a dashboard I didn’t recognize:

* false positives spiking
* customers getting flagged for things that weren’t happening
* support tickets reading like: *“Why did you block me? I literally just paid.”*

I remember messaging my lead:

> “Offline accuracy is 0.99. Production is… not.”

He didn’t ask about the model.

He asked one sentence that felt annoyingly obvious after I heard it:

> “Did you split by time?”

This post is what happened next — not in textbook language, but in “I had to fix this fast without lying to myself” language.

Because here’s the system-design truth underneath:

> **A model isn’t an artifact. It’s a contract inside a system.**
>
> If your evaluation violates causality, the contract is fake.

We’ll go step-by-step:

1. The exact leakage I introduced (and why it’s sneaky)
2. The time-aware evaluation that exposed it
3. The “feature ownership” shift that prevented it from recurring
4. Turning scoring into a service with invariants (latency, parity, auditability)
5. The checklists and templates I now reuse for every model I ship

---

## 1) The feature that looked innocent

The dataset wasn’t exotic:

* `transaction_id`
* `user_id`
* `amount`
* `merchant_id`
* `event_time`
* `chargeback_label` (eventually known)

And a handful of “behavioral” features.

The trouble feature was this:

* `user_chargebacks_last_30d`

It sounds legitimate.

In production, it *is* legitimate.

In my pipeline, it was **computed incorrectly**.

### What I did (the mistake)

I computed “last 30 days” using the whole dataframe before splitting:

```py
# ❌ wrong: computed using future rows too
# assumes df sorted by event_time

df['user_chargebacks_last_30d'] = (
  df.sort_values('event_time')
    .groupby('user_id')['chargeback_label']
    .rolling('30D', on='event_time')
    .sum()
    .reset_index(level=0, drop=True)
)

X = df[feature_cols]
y = df['chargeback_label']

# random split after leakage is already baked in
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
```

On paper, it looked clean.

In reality, it created this situation:

* a transaction on **June 20**
* got a feature value that included outcomes from **June 25–June 30**
* because the rolling window had access to “future” labels in the dataset

This is **label leakage through time**.

It’s not the model being smart.

It’s me accidentally giving it tomorrow’s newspaper.

---

## 2) Why this produces “99% accuracy” (and why it’s a lie)

When leakage exists, the model’s job becomes trivial:

* “if future chargebacks are already reflected in your feature, predict chargeback”

So metrics look incredible.

And you feel incredible.

And you ship.

Then production reminds you that **future data isn’t available at prediction time**.

The “99% accurate” model never existed.

Only the benchmark did.

---

## 3) The fix wasn’t a better model — it was a better split

I replaced random splitting with a strict time split.

### Step 1: split by time

```py
# ✅ right: split by time boundary

df = df.sort_values('event_time')
cutoff = df['event_time'].quantile(0.80)

train = df[df['event_time'] <= cutoff].copy()
test  = df[df['event_time'] >  cutoff].copy()
```

This creates a simple invariant:

> **test data must be strictly later than train data**

Now the model must predict the future using only the past.

That’s the real job.

### Step 2: recompute time-dependent features inside each split

Instead of building features globally, I made feature computation respect the boundary.

Here’s the practical version (not the most optimized, but correct):

```py
from collections import defaultdict
import pandas as pd

# ✅ compute rolling counts using only historical labels

def add_user_chargebacks_last_30d(df: pd.DataFrame) -> pd.DataFrame:
    df = df.sort_values('event_time')
    # Store timestamps of past chargebacks per user
    cb_times = defaultdict(list)
    out = []

    for row in df.itertuples(index=False):
        uid = row.user_id
        t = row.event_time

        # keep only last 30d
        cutoff = t - pd.Timedelta(days=30)
        cb_times[uid] = [x for x in cb_times[uid] if x >= cutoff]

        # count past chargebacks (strictly before current event)
        out.append(len(cb_times[uid]))

        # update history if THIS event is a chargeback (label known here because we’re building training data)
        if row.chargeback_label == 1:
            cb_times[uid].append(t)

    df['user_chargebacks_last_30d'] = out
    return df

train = add_user_chargebacks_last_30d(train)

# For test, you must seed history using ONLY train history
# In real systems this is exactly why feature ownership matters (we’ll get there)
```

After this fix:

* my accuracy dropped
* my ego dropped
* my confidence increased

Because the metric started meaning something.

---

## 4) The moment my thinking changed: “who owns features?”

The real incident wasn’t “I used the wrong split.”

It was that features were **defined nowhere**.

They existed as:

* a notebook cell
* an intuition
* a handful of pandas operations

That is not a contract.

That is a vibe.

So I adopted a rule that feels boring but is wildly stabilizing:

> **Every production feature must have: (1) a single definition, (2) a single owner, (3) an availability guarantee.**

That rule forced architecture.

Because once you ask “availability guarantee,” you’re immediately in systems design territory:

* When is this feature computed?
* Where is it stored?
* How is it retrieved?
* What happens when it is missing?
* How do we keep offline (training) and online (serving) consistent?

This is where “data mining” becomes “shipping.”

---

## 5) The minimal feature-store mindset (without building a full feature store)

I didn’t spin up a massive feature platform.

I did something more realistic for a small team:

### 5.1 Offline features (batch)

A daily job computes slow-but-stable features:

* `user_lifetime_txn_count`
* `user_lifetime_chargeback_count`
* `user_avg_amount_90d`

Stored in a table keyed by `(user_id, as_of_date)`.

```sql
CREATE TABLE user_features_daily (
  user_id VARCHAR(64) NOT NULL,
  as_of_date DATE NOT NULL,
  lifetime_txn_count BIGINT NOT NULL,
  lifetime_chargeback_count BIGINT NOT NULL,
  avg_amount_90d DOUBLE NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, as_of_date)
);
```

### 5.2 Online features (real-time)

Some features must be computed live:

* `txn_velocity_5m`
* `ip_change_last_24h`

These can come from:

* Redis
* a streaming store
* a small aggregation service

### 5.3 Parity (the non-negotiable bridge)

Same feature name must mean the same thing.

So I added a parity test:

```ts
// pseudo-code
function assertClose(a: number, b: number, tol: number, name: string) {
  if (Math.abs(a - b) > tol) throw new Error(`Parity failed for ${name}: offline=${a} online=${b}`);
}

assertClose(offline.user_avg_amount_90d, online.user_avg_amount_90d, 0.01, 'user_avg_amount_90d');
```

This is simple.

But it turns “we think it matches” into “it’s enforced.”

And it prevents the most common production failure mode:

> **The model is fine. The feature pipeline isn’t.**

---

## 6) Turning scoring into a system (SDE lens)

Once I fixed leakage, I still had production failures.

Not from wrong predictions.

From missing system decisions.

### The core shift

A scoring model is not a file.

It’s a service.

So I designed the scoring path like an API with invariants:

```
[API Request]
   -> [Feature Fetch (offline + online)]
      -> [Feature Validation + Defaults]
         -> [Model Score]
            -> [Decision Policy]
               -> [Audit Log + Explainability]
```

And each box has explicit responsibilities.

### 6.1 Latency budgets

If scoring blocks checkout, you need a hard budget:

* p95 < 50ms (example)

Which means:

* avoid slow joins
* precompute what you can
* cache per-entity features

### 6.2 Fallback behavior

The most senior question isn’t “what’s your accuracy?”

It’s:

> “What happens when scoring fails?”

I implemented a policy:

* if online features missing → degrade to a conservative rule
* if scorer down → allow transaction but flag for async review (depending on business)

**The system must have a safe mode.**

### 6.3 Audit log (the thing that makes your system defensible)

If you ever block a user, you need to answer:

* “why?”
* “based on what data?”
* “what version of the model?”
* “what threshold?”

So I logged:

```sql
CREATE TABLE risk_decisions (
  decision_id CHAR(36) PRIMARY KEY,
  event_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  model_version VARCHAR(32) NOT NULL,
  score DOUBLE NOT NULL,
  threshold DOUBLE NOT NULL,
  decision ENUM('allow','review','block') NOT NULL,
  top_features JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

This is not ML fluff.

This is system accountability.

---

## 7) The production failure I didn’t expect: drift

After fixing leakage, I still saw performance decay over weeks.

Not because the model broke.

Because the world changed.

* new merchants
* new user behavior
* new fraud strategies

### Drift monitoring (practical)

I tracked distribution shift on key features:

* `amount`
* `velocity`
* `geo_distance`

And alerted if PSI (population stability index) crossed a threshold.

Even if you don’t implement PSI, you can do the simplest thing:

* track mean/std per day
* compare to baseline
* alert on deviation

The lesson:

> **Monitoring is part of the model.**

If you ship a model without monitoring, you shipped a demo.

---

## 8) The postmortem I wrote (and what I learned)

Here’s how I summarized the incident in human terms:

* **What happened:** offline metrics overstated real performance; production decisions degraded
* **Root cause:** time-based leakage from feature computation + random split evaluation
* **Contributing factors:** features defined in notebooks; no parity tests; no scoring fallback
* **Fix:** time-based split; feature definitions moved into shared library; parity assertions; audit + fallback
* **Prevent recurrence:** feature ownership policy; monitoring; automated evaluation pipeline

This is the “systems analysis” version of ML.

And it makes you employable.

Because teams don’t hire “people who can train models.”

They hire “people who can ship systems that keep working.”

---

## 9) Steal these checklists

### 9.1 Leakage checklist (run before trusting metrics)

1. Are any features computed using the whole dataset?
2. Are labels or outcomes used in feature computation?
3. Are time windows computed relative to the row time (and only past)?
4. Is the split time-aware and strictly causal?
5. Is the evaluation repeated across multiple time slices?

### 9.2 Shipping checklist (model → service)

1. Latency budget defined
2. Feature availability contract defined
3. Online/offline parity tests exist
4. Safe fallback behavior defined
5. Audit log captures model version + inputs summary
6. Drift monitoring exists
7. Retraining trigger policy exists

---

## 10) What changed in me (the human part)

Before this incident, I thought “shipping ML” meant:

* train
* evaluate
* deploy

After this incident, “shipping ML” means:

* define contracts
* enforce causality
* build parity
* design fallbacks
* log decisions
* monitor drift

The model is only one part.

The system is the product.

And the day my “99% accurate” model failed was the day I stopped confusing notebooks with reality.

---

## 11) If you want to use this as an interview story

Here’s the clean system-design framing:

* **Problem:** offline metrics misled deployment; production false positives
* **Root cause:** evaluation violated causality (time leakage)
* **Solution:** time-based splitting + feature ownership + parity checks + auditability
* **Outcome:** stable production behavior + explainable decisions + repeatable pipeline

That’s a senior narrative.

Not because it’s fancy.

Because it respects invariants.

---

### Appendix: Minimal architecture diagram you can paste into docs

```
                 (batch)
  [raw events]  -----------> [offline feature job] ---> [feature table]
       |                                                  |
       | (stream)                                         | (read)
       v                                                  v
  [online agg] ---> [online features cache] -----> [scoring service] ---> [decision + audit]
                        ^                     (parity tests)   |
                        |                                      v
                     [monitoring + drift alerts]          [review queue]
```

---

If you want Post 02 next (same format, much deeper): **reply “Next: Post 02”**.
