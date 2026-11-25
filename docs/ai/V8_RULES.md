# JACKLABS V8.0 — Context-Efficient Continuous Delivery Addendum

## Mission
Combine V4–V7 workflows in one cross-project orchestration system. Preserve user project rules, V6 engineering/security and V7 marketplace checks. This file ADDS rules; it does not erase earlier requirements.

## Order of operations
1. Confirm repository root and target task from the current user instruction.
2. Read root `AGENTS.md`, `docs/ai/V8_MODES.md`, `docs/ai/TASK_STATE.json`, `docs/ai/SESSION_HANDOFF.md`, then *relevant* roadmap/backlog sections. Do not read entire docs for routine steps.
3. Compare checkpoint against `git status --short`, `git diff --stat`, current files and test evidence. Treat saved completion as provisional until verified.
4. Use existing Graphify graph for dependency discovery when needed. If code changed since graph build, `graphify update .` with a code-only fallback if no LLM configured. Do not dump graph.json or re-index unrelated docs.
5. Select the FIRST unfinished, unblocked step of the explicitly named task. Do not silently change task/project because of stale backlog. If user requests a new task, that request takes precedence.
6. Inspect only relevant code, implement the minimal safe increment; run targeted tests plus broader tests if warranted; review diff.
7. Save checkpoint after meaningful milestone: task ID, current step, completed/pending, files, tests with command and timestamp, blockers and exact next action.
8. Stop at one atomic step in NEXT_STEP; in RESUME execute remaining steps of the named task only when policy permits, with checkpoints between steps. Never start a different feature automatically.

## Token budget discipline
- No promise of zero LLM tokens. Graphify local AST and CLI tests can be run outside the AI Agent without model consumption, but interpreting their output costs tokens.
- Graphify query → concise paths/edges → scoped file reads. Avoid repeated full repository inspection, repeated documents, long command output and full graph JSON.
- Skip Graphify for a trivial known-file edit. Limit tool output and summarise verified details, not source dumps.
- Do not repeatedly call `graphify update .` if source has not changed and graph is current.

## Safety & correctness
- Security first; authorization and tenant/data ownership checks; validation; transactions & concurrency where relevant; centralized exception handling. Avoid try/catch everywhere without a recovery requirement.
- For concurrency claims, test on the real target DB engine when possible; SQLite test PASS does not prove MySQL row-level locking.
- No destructive DB changes, production deploys, paid API actions, marketplace submissions or live demo resets without explicit authorization.
- Review unexpected dirty Git changes; never discard/revert unrelated work. If tests fail, state it honestly and do not mark DONE.
- Actual tests and filesystem state overrule self-reported status. Mark UNKNOWN / BLOCKED when evidence is missing.
- Marketplace claims use current official published requirements; check platform-specific rules instead of promising acceptance.
- One feature / one remediation per cycle unless the user explicitly requests a batch. Prioritize severity and dependencies, not merely list position.

## Mode precedence
Explicit user constraints > safe operation > project AGENTS.md > V8 orchestrator > V7 marketplace > V6 engineering > legacy modes. Resolve conflicts visibly rather than silently overriding project-specific policy.

## UI & product
Use the existing frontend framework. Design audit before redesign, record design tokens and capture real browser screenshots if tools permit. Don't invent visual QA evidence. Competitor research: cite sources and dates; don't recrawl when fresh and unchanged.

## Exit report
Concise: completed step, modified files, tests PASS/FAIL/NOT RUN, blockers, next step, checkpoint location. Do not claim 100% readiness from a partial test suite.
