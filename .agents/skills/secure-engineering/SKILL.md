---
name: secure-engineering
description: Audit and harden router, controller, model, API and application trust boundaries.
---
# secure-engineering
Read AGENTS.md and docs/ai/V6_RULES.md. Use scoped discovery, record task checkpoints and preserve unrelated changes.

1. Identify exposed entrypoints (HTTP, RPC, webhook, job, CLI), trust boundaries, roles and ownership. Build route matrix: method/path, auth, permission, object/tenant check, validation, abuse limit, output fields, evidence. Mark explicit public routes and justification.
2. Trace route → middleware → validator → controller → service → persistence → response. Inspect actual code and framework version. Check bypass via alternate endpoints, direct IDs, batch/export/search, nested resources, background workers and cache.
3. Review injection (SQL/command/template), contextual output escaping, CSRF for cookies, explicit CORS, SSRF with allowlisted destinations and redirect/DNS controls where needed, upload size/type/content/storage, path traversal, session fixation/rotation, credential hashing and secure cookie flags, token lifecycle, secrets, dependency vulnerabilities. Do not log sensitive fields. Avoid home-grown crypto.
4. Review exception mapping: validation 400/422 per contract, unauthenticated 401, forbidden 403 or deliberate 404, missing 404, conflict 409, throttled 429, unexpected 500 with safe body. Map centrally; catch at recovery/translation boundary, preserve cause, no silent catches or duplicate logging. Transactions rollback; clean up temporary resources in finally when needed.
5. Record finding ID, severity, reachable path, affected files/lines, expected/observed behavior, fix, test and status. Prioritize exposed unauthorized access/data leaks before cosmetic cleanup. Use synthetic fixtures only. Implement one batch if authorized; test normal, invalid, unauthenticated, forbidden, other-tenant, mass assignment, injection/escaping and error paths relevant to change. Save security audit and route matrix.

Report actual evidence, unresolved blockers and next action.
