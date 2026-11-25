# UNIVERSAL AI DEVELOPMENT RULES V6.0

## Project identification
- Verify actual framework, language, database, build/test commands from repository files. Do not infer project-specific facts.
- Follow established architecture and naming. Communicate findings in Vietnamese.
- Source code and executed tests take precedence over stale reports or graph metadata.

## Start-of-session continuity
1. Read this file. If present, read `docs/ai/TASK_STATE.json` and `docs/ai/SESSION_HANDOFF.md` (keep reads scoped).
2. Inspect `git status --short`, current branch, and only relevant recent changes.
3. Compare saved completion claims with source/tests. Status files are notes, not proof.
4. If an active task exists, continue it unless the current user request supersedes it.
5. Do not silently change the active task or mark it done without verification.

## Graphify & context efficiency
- For cross-module work, check Graphify availability and whether an existing graph is usable.
- Refresh with `graphify update .` when source changed and graph is present; if missing, inspect `graphify --help` and build with `graphify . --code-only` when suitable.
- Use `graphify query`/`path`/`explain` to narrow scope; read actual affected code before editing.
- Do NOT insert entire `graphify-out/graph.json`, huge outputs, build artifacts or lockfiles into context.
- For simple localized changes, skip expensive graph reconstruction and inspect the known files directly.
- If Graphify fails, record blocker and use targeted file discovery.
- Token efficiency must never bypass correctness, security, or tests.

## Task execution
1. Restate acceptance criteria briefly and identify the smallest safe implementation scope.
2. Identify dependencies and affected files.
3. Plan before complex changes; implement one logical feature at a time.
4. Prefer existing components/services; avoid broad refactors and unnecessary dependencies.
5. Validate inputs, permissions, error handling, backward compatibility and relevant security risks.
6. Inspect available test scripts; run the relevant checks. Never claim a test passed without running it.
7. Review diff for unintended changes.
8. Refresh Graphify only when underlying graph inputs changed.
9. Update task state, session handoff, and product/architecture documents as appropriate.

## Persistent task state
- Keep `docs/ai/TASK_STATE.json` valid JSON: stable task IDs, explicit status, completed/pending steps, touched files, test outcomes, blockers, next action, and verification reference.
- Accepted task statuses: `todo`, `in_progress`, `blocked`, `review`, `done`.
- Update after meaningful checkpoints and when interrupted, not after every command.
- `docs/ai/SESSION_HANDOFF.md` should be concise, ideally under 60 lines and focus on immediate resumption.
- Never overwrite user work or erase unresolved task entries.

## Commercial research
- When asked to analyze competitors, invoke the `product-growth` skill.
- Check existing `docs/product/` and verify staleness; use fresh trustworthy sources for changed data.
- Separate direct competitors, adjacent products, opinions, verified facts and unknowns.
- Prioritize by customer demand, revenue potential, advantage, feasibility and maintenance.
- Do not fabricate pricing, market share, users, URLs, features or test results.
- Never copy proprietary competitor code/design; implement independently.

## Safety
- No production deployment, destructive migration, payments, or external paid actions without explicit authorization.
- Do not expose `.env`, keys, access tokens, credentials or sensitive production data.
- Review destructive operations and schema migrations carefully.
- Preserve working functionality and avoid unrelated changes.

## Final response contract
Report: task ID/status, work performed, changed files, tests actually run and their results, unresolved blockers, next concrete action. If uncertain, say unverified.

## V5 mode routing
Read `docs/ai/ENGINE_MODES.md` when choosing a workflow. Explicit user mode takes precedence. Default FEATURE for a requested feature, BUGFIX for a specific defect, AUDIT for assessment only, RESUME only when requested or continuing the same task. AUTO selects one scoped improvement; never silently redesign the whole app. Use the relevant skill only, not every skill. For REDESIGN use ui-ux-audit, design-system, ui-modernization and visual-qa in that order as needed. OPTIMIZE uses performance; RELEASE uses release-readiness. Do not start unrelated tasks.

## UI/UX and design guardrails
- Read existing design system and relevant UI evidence first; use `docs/design/` as persistent knowledge. Verify framework and component library; preserve existing stack, branding, business logic, authorization, accessibility and workflows. No framework migration or global redesign without explicitly authorized scope.
- Research current standards and relevant references only when needed; record source URL, access date, evidence and limitations. Trends are optional, not standards. Never copy protected assets or proprietary design.
- Establish tokens and reusable components before broad styling. Use semantic HTML, keyboard navigation, visible focus, accessible names, contrast, responsive layouts, reduced-motion preferences, and clear loading/empty/error/success states. Target WCAG 2.2 AA; do not claim conformance without evidence.
- Implement one bounded screen group or component family per cycle. Capture baseline and after screenshots if browser available, verify behavior and responsive layouts, and record untested items. Never claim visual tests passed without running them.
- Keep task checkpoints in existing V4 task files; update design docs only where relevant. Do not automatically redesign on ordinary feature or bugfix requests.

## V6 activation (Jacklabs enterprise addendum)
For every task, read `docs/ai/V6_RULES.md` and use `docs/ai/V6_MODES.md` for routing. V6 supplements V5 and requires scoped engineering quality gates for code changes. Read only relevant skills and stack profiles. For pre-existing AGENTS.md, merge this section and reconcile conflicts; do not remove project-specific instructions.


## V9 activation (Jacklabs formatting addendum)
Read docs/ai/V9_RULES.md, docs/ai/V9_MODES.md and docs/engineering/FORMATTING_POLICY.md for source style tasks. Use FORMAT_CHECK before explicit FORMAT_APPLY. Default to Git-changed relevant files only and installed project-compatible tools. Preserve V6-V8 rules and existing checkpoints. Marketplace quality goes beyond formatting.
