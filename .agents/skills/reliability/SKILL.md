---
name: reliability
description: Review scale, reliability, operational security, logs, queues and recovery.
---
# reliability
Read AGENTS.md and docs/ai/V6_RULES.md. Use scoped discovery, record task checkpoints and preserve unrelated changes.

Define workload, SLO/latency/error targets as assumptions until measured. Capture baseline using representative synthetic data and approved environment. Inspect pagination, N+1, indexes, connection pools, resource limits, memory and hot paths. Define cache key scope, TTL, invalidation and stampede controls. Jobs: idempotency, bounded retry with jitter, timeout, dead-letter handling, observability; ensure dispatch after transaction commit where needed. External calls: timeouts, bounded retries only safe operations, circuit breaker if justified. Structured redacted logs, correlation IDs, metrics, health/readiness endpoints with no sensitive internals, audit trail for privileged actions. Document backup/restore, migration rollback and recovery objectives; test restore on disposable environment. Compare baseline/after under same workload; do not promise capacity without evidence. Keep shared hosting or deployment constraints of target buyers; do not introduce mandatory Redis/Kafka unless justified and documented.

Report actual evidence, unresolved blockers and next action.
