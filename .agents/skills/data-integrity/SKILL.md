---
name: data-integrity
description: Protect database models, transactions, tenant boundaries and migration safety.
---
# data-integrity
Read AGENTS.md and docs/ai/V6_RULES.md. Use scoped discovery, record task checkpoints and preserve unrelated changes.

Inventory affected entities, keys, constraints, relationships and data classification. Validate fields and ownership server-side; explicit write allowlists and response projections; do not trust derived totals from clients. Use parameterized queries and tenant predicates on read/write/delete/count/export and jobs. Verify unique constraints (often tenant + key), foreign keys, not-null and check constraints where supported. Use transactions for atomic writes; external calls outside long locks, outbox when required. Test duplicate requests, concurrent updates, race conditions, rollback and partial failures. Use integer minor units or decimal for money, explicit currency/timezone. Evaluate indexes and query plans on safe data; avoid unbounded reads. Migrations: expand/contract for compatibility, backfill in batches, backup/restore rehearsal, reversible where feasible with explicit rollback plan. Never run destructive migrations or production resets without explicit approval. Test tenant A cannot access tenant B, including nested IDs, cache and files. Record data integrity report and migration plan.

Report actual evidence, unresolved blockers and next action.
