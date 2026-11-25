---
name: concurrency-guard
description: Audit or repair transaction consistency, checkout/POS overselling, idempotency, data ownership and race conditions with database-specific test evidence.
---
# Concurrency & Data Safety

Map exact inventory write paths via Graphify. Identify stock invariants, lock scope, transaction boundaries, deadlock handling and idempotency. Prefer atomic DB updates or `lockForUpdate()` inside transactions where target database supports them. Don't treat SQLite in-memory simulation as proof of MySQL row locking. Reproduce race with isolated database and targeted tests, no production mutation. Check POS, checkout, returns, reservations and cancellations according to actual repository features. Preserve business rules and write checkpoint.
