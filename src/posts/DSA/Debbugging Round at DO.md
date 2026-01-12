---

title: "The Debugging Round That Was Not LeetCode: Building a Mental Playbook for GenAI Infra"
date: "2026-01-12"
summary: "A recruiting note about an Applied ML debugging panel pushed me to rebuild my prep around real production failures: leaks, tail latency, scheduling, drift, and version mismatches."
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## 1. The moment the system surprised me

The recruiter message was short: the Applied ML panel would focus on debugging.

That single word changed the whole prep plan. I was ready to grind coding prompts, but the thread immediately turned into something else. We went hunting for how this company runs a debugging round, and we found a pattern: candidates describe a live debugging session grounded in real scenarios, sometimes paired with system design, explicitly not a LeetCode vibe.

Then the job description landed in my lap. It was a GenAI team building developer tooling for AI agents, with a stack that hits every fault line I have seen in production: Go services, GraphQL APIs, Python model code, React and TypeScript UI, plus the infra layer that makes inference actually work.

I realized I could not prep by memorizing answers. I needed a repeatable way to reason when things go sideways.

This post is that playbook, distilled from this chat thread.

Sanitization note: I removed all company names, personal names, and any identifiers. I refer to the target org as Company A, the role as GenAI Software Engineer, and any IDs as placeholders.

## 2. What I thought was true (and why it was wrong)

I thought the debugging round would be a coding problem with a bug planted in it. Something like “find the off-by-one,” fix it, move on.

That belief broke in three places in this thread.

1. The public candidate reports we surfaced describe debugging as a real-world diagnostic conversation: read symptoms, follow evidence, fix or propose a fix, then talk about prevention. It sounded closer to incident response than to puzzle solving.
2. The interviewer profile in the thread screamed platform reliability. The listed strengths were troubleshooting, debugging, monitoring, CI/CD, Kubernetes, logging stacks, and Go and Python. That is not a profile that spends an hour watching me invert a binary tree.
3. The job description itself anchors the work in end-to-end delivery: model integration, API maintenance, reliability, scalability, and performance. Debugging here means being able to localize failures across a boundary. Go calls Python. GraphQL fan-outs to a database. A model rollout shifts tail latency. A pod stays Pending because the cluster cannot satisfy constraints.

So the mental model changed.

Debugging is not “find the bug.” It is “build the shortest path from symptom to root cause, while keeping the system safe.”

## 3. The smallest reproducible example

The chat converged on five failure families. I kept rewriting them until each became a minimal reproducible case I could hold in my head.

1. Training does not learn.
2. Inference latency drifts upward over time.
3. GraphQL p99 explodes on list queries.
4. Go to Python bridge leaks resources.
5. Kubernetes inference pods remain Pending.

The key is that each case has two layers: the immediate symptom and the hidden coupling that caused it. The debugging round is going to probe whether I see both.

Here is a minimal example of the kind of training bug we kept circling in the thread, because it shows the pattern: mismatch between what the loss expects and what the data loader produces.

```python
# Python, minimal reproduction of a flat-loss + shape mismatch trap

import torch
import torch.nn as nn

model = nn.Linear(16, 2)
loss_fn = nn.CrossEntropyLoss()

# Bug: labels shaped (N, 1) and float, but CrossEntropyLoss expects (N,) long
x = torch.randn(32, 16)
y = torch.randint(0, 2, (32, 1)).float()

logits = model(x)
loss = loss_fn(logits, y)  # RuntimeError: expected target size (N), got (N,1)
```

The technical detail matters less than the debugging reflex.

1. Print shapes.
2. Confirm loss expectations.
3. Fix the interface between the dataset and the model.

Now the same minimal case, corrected.

```python
# After: labels match loss contract
y = torch.randint(0, 2, (32,), dtype=torch.long)
loss = loss_fn(logits, y)
```

That is one small reproducible example, but the thread made it clear that the debugging round will not stop there. It will step across boundaries, so I made one minimal infra example too, because it is the kind of thing that quietly kills a Go service under load.

```go
// Go, minimal reproduction of HTTP resource leak patterns in a sidecar call.
// Identifiers sanitized.

func callSidecar(url string) ([]byte, error) {
  resp, err := http.Get(url)
  if err != nil {
    return nil, err
  }
  // Bug: resp.Body is never closed, connections leak, goroutines pile up.
  return io.ReadAll(resp.Body)
}
```

In a real service, this does not fail immediately. It fails when tail latency climbs and the process slowly becomes a haunted house of stuck connections.

The whole point of the debugging round is recognizing that kind of slow failure.

## 4. The fix that worked (and the one that did not)

The thread forced me into a “fix-by-evidence” mindset. I had to be able to say not just what I would do, but what I would try first, what I would measure, and what I would reject.

### The fix that did not work

In the Go to Python sidecar example, the naive fix is often “add more timeouts” or “restart pods more aggressively.” That can reduce the visible pain without addressing the leak.

If the underlying problem is unclosed bodies or non-reused clients, restarts hide the symptom and defer the root cause. It also trains you to accept churn.

I would still use restarts as a temporary mitigation if the service is burning down, but it is not the fix.

### The fix that worked

The working fix is boring and contractual: make the HTTP call correct, reuse the client, enforce timeouts, and always close the body.

Here is the “before vs after” snippet, because it is the kind of thing I would expect in a live debugging session.

```go
// Before: leaks resources under load.
func callSidecar(url string) ([]byte, error) {
  resp, err := http.Get(url)
  if err != nil {
    return nil, err
  }
  return io.ReadAll(resp.Body)
}
```

```go
// After: closes body, reuses client, and ties lifetime to context.
var client = &http.Client{
  Timeout: 5 * time.Second,
}

func callSidecar(ctx context.Context, url string) ([]byte, error) {
  req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
  if err != nil {
    return nil, err
  }

  resp, err := client.Do(req)
  if err != nil {
    return nil, err
  }
  defer resp.Body.Close()

  return io.ReadAll(resp.Body)
}
```

This is not a fancy answer. That is the point. Debugging rounds often reward the engineer who fixes the boring contract violation quickly, then moves on to prevention and observability.

The same pattern showed up in other areas.

1. For p99 GraphQL latency, the fix is often batching and request-scoped caching, not micro-optimizing JSON serialization.
2. For Kubernetes Pending pods, the fix is often matching requests and tolerations to the cluster’s actual constraints, not tweaking application code.
3. For flat training loss, the fix is often data and loss contract alignment, not exotic architectures.

The chat also pushed me to treat “what the tool expects” as a first-class concept. Kubernetes expects schedulable resource requests. A loss expects label shapes. HTTP expects bodies to be closed. GraphQL expects you not to create N+1 storms.

## 5. The deeper system design principle

The central lesson I took from this thread is simple.

Most debugging failures are contract failures across boundaries.

The boundary might be:

1. Dataset to loss function.
2. Client to server via HTTP.
3. GraphQL resolver to database.
4. Deployment spec to scheduler.
5. Model artifact to tokenizer and preprocessor.

When a contract fails, the system often does not crash immediately. It degrades.

The thread kept circling the same themes, so I wrote them down as “contracts I would check first in a debugging panel.”

1. Shape and dtype contracts in ML training and inference.
2. Resource lifetime contracts in Go: closing bodies, canceling contexts, reusing transports.
3. Fan-out contracts in GraphQL: resolver design cannot multiply work per item silently.
4. Scheduling contracts in Kubernetes: a pod spec must match the cluster reality.
5. Version contracts in GenAI: model and tokenizer must move as a unit, and the system must log their identities.

That is why the most useful prep output from this chat was not a list of trivia. It was a repeatable playbook that starts at contracts and moves outward.

## 6. Tradeoffs I accepted on purpose

The thread asked for a list of “most probable questions.” We ended up with a large set and then created cheat sheets. The tradeoff was coverage versus depth.

I picked depth.

1. I accepted that I will not memorize 50 answers. I will memorize the contract-first playbook.
2. I accepted that some fixes will be partial in an interview setting. For example, I might not fully implement a DataLoader for GraphQL in a live session, but I can prove I see the N+1 pattern and propose the batching change.
3. I accepted that I will talk about mitigation versus root cause explicitly. Restarting pods can be a valid mitigation, but I will say so and then pivot to why it is not sufficient.
4. I accepted that model quality questions and infra questions should share one vocabulary: inputs, outputs, latency, failure modes, observability. That keeps my answers coherent when the panel jumps layers.

To keep myself honest, I wrote down a comparison table from the thread’s themes. It forces me to think in terms of symptoms, likely contracts, and next actions.

| Symptom in interview                  | High-probability root cause family                   | First check I say out loud                       | Primary tool or artifact              |
| ------------------------------------- | ---------------------------------------------------- | ------------------------------------------------ | ------------------------------------- |
| Training loss flat, accuracy random   | Loss or label contract mismatch, data pipeline issue | Shapes, dtypes, label encoding, model train mode | Print batch shapes, loss expectations |
| Inference p99 drifting upward         | Resource leak, GC pressure, hanging calls            | Open connections, goroutines, memory growth      | Profiles, metrics trends, timeouts    |
| GraphQL list query slow in prod only  | N+1 resolver fan-out, payload explosion              | Query count per request, resolver loops          | Tracing, DB query logs, pprof         |
| Pod stuck Pending                     | Scheduler contract mismatch                          | `kubectl describe pod` events, requests/taints   | Events, node capacity, selectors      |
| Output quality degraded after rollout | Version mismatch, drift                              | Model and tokenizer version identity             | Version tags in logs, canary compare  |

This table is how I plan to answer under pressure. It is the fastest path from symptom to hypothesis.

## 7. Mistakes and course corrections

This thread had real mistakes, and I want them in the open because a debugging panel often probes how you learn.

### Mistake 1: I treated “debugging round” as a narrow coding format

At the start, I was still thinking about a bug planted in a toy snippet. That was not aligned with the evidence we pulled from candidate reports and the job description.

Course correction: I rebuilt prep around cross-boundary contracts, not puzzles. That is why the mock problems became full-stack scenarios like “Go to Python bridge leaks” and “GraphQL p99 explodes,” not “fix a loop.”

### Mistake 2: I let coverage explode and almost lost the narrative

I asked for “almost 50 questions,” then started answering them in batches. That is useful, but it risks turning into trivia memorization. The list became the plan, instead of the playbook being the plan.

Course correction: I collapsed 1 through 35 into a single mental model and cheat sheet. The cheat sheet is not a summary of facts. It is a sequence of contracts to check and tools to use.

### Mistake 3: I initially trusted web summaries too quickly

In the early research responses, the content leaned on a small set of public sources. Some were thin. That is normal for interview anecdotes, but it is also easy to overfit to them.

Course correction: I used the external reports only to confirm the format. I used the job description and the interviewer’s platform background to drive the content of the prep. That keeps me from anchoring on one person’s interview story.

## 8. Operational checklist

1. When given a symptom, restate it in one sentence and ask what “expected behavior” means.
2. Identify the boundary first: data to model, client to server, resolver to DB, pod spec to scheduler, artifact to runtime.
3. Collect the smallest artifact that collapses uncertainty: a single batch, a single request trace, a single `kubectl describe`, a single profile snapshot.
4. Verify contracts in this order: shapes and dtypes, resource lifetimes, fan-out work, scheduling constraints, version identities.
5. Propose a minimal fix and a validation step, not a redesign.
6. If proposing mitigation, label it mitigation and name the root cause you still plan to fix.
7. Add one prevention step: a test, an assertion, a metric, or a deployment guard.
8. Close with what you would monitor after the fix: p99 latency, error rate, memory growth, pod Pending time, drift metrics.

## 9. Key learnings

1. Debugging rounds often reward contract thinking more than cleverness.
2. Most production failures degrade first, then fail. Leaks and tail latency are the early smoke.
3. The fastest wins come from validating interfaces: loss contracts, HTTP lifetimes, resolver fan-out, scheduler constraints.
4. Every fix needs a verification artifact. A patch without measurement is a story.
5. Coverage is a trap. A small number of repeatable playbooks beats memorizing many answers.
6. Version identity is part of the runtime. Model and tokenizer should move as one artifact with logged metadata.
