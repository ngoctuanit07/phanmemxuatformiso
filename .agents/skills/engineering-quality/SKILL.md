---
name: engineering-quality
description: Review code standards, static analysis, exception handling and executable quality gates.
---
# engineering-quality
Read AGENTS.md and docs/ai/V6_RULES.md. Use scoped discovery, record task checkpoints and preserve unrelated changes.

Detect language/framework from manifests and actual versions. Read only matching stack profile. Inspect existing format/lint/static/test scripts; use installed tools without silently fetching or executing untrusted dependencies. Review naming, meaningful types, cohesion, duplication, dead code, hardcoded config, public API contracts, error paths, testability and compatibility. Use framework exception handler; avoid try/catch mechanically in every function. Check expected errors, unexpected errors, rollback, safe response and logging. Run relevant existing checks; record command, exit code, scope and artifacts. Cover happy path, invalid input, unauthenticated/unauthorized, ownership, conflicts, failed dependency and regression where applicable. If tooling missing, mark UNVERIFIED and propose setup. Review git diff for unrelated edits. Fill gate evidence and block completion for required failures. No fabricated coverage score or arbitrary complexity threshold.

Report actual evidence, unresolved blockers and next action.
