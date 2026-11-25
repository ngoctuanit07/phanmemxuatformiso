# Resume Protocol V8 — Minimal Context + Verified State

1. Identify project root, target task ID and mode from user request.
2. Read AGENTS.md, TASK_STATE.json, SESSION_HANDOFF.md, latest specific backlog/roadmap entries only.
3. Inspect `git status --short`, `git diff --stat`, relevant files, and most recent test evidence. Check source changed since handoff.
4. Graphify only when it improves locating dependencies: `graphify update .` if stale, query narrowly for affected classes. If CLI fails, use targeted grep and report fallback.
5. Build a short internal checklist: verified done, in-progress, unverified, blocked, next safe step.
6. NEXT_STEP: one step and stop. RESUME: only the named task, never other backlog items.
7. Before modifying code, check ownership/authorization, validation and impacted tests.
8. After step, run relevant tests, inspect diffs and update TASK_STATE.json + SESSION_HANDOFF.md. Graphify update only if code changed.
9. Never set status=done without proof. Record commands and results, including NOT_RUN with explanation.

## Task status vocabulary
`pending`, `in_progress`, `blocked`, `done`, `unverified`. The `done` status must have evidence and validation against current Git/source. The JSON schema is documented in TASK_SCHEMA_V8.md; older state files remain valid and must be migrated additively, not overwritten.

## Interruptions
If a previous agent stopped halfway, inspect existing code and diff before resuming. Don't rerun data migrations or installers by default. Explain uncertainty and resume safely.
