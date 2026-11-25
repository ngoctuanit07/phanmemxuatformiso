# V5 addendum — merge into existing AGENTS.md

## V5 mode routing
Read `docs/ai/ENGINE_MODES.md` when choosing a workflow. Explicit user mode takes precedence. Default FEATURE for a requested feature, BUGFIX for a specific defect, AUDIT for assessment only, RESUME only when requested or continuing the same task. AUTO selects one scoped improvement; never silently redesign the whole app. Use the relevant skill only, not every skill. For REDESIGN use ui-ux-audit, design-system, ui-modernization and visual-qa in that order as needed. OPTIMIZE uses performance; RELEASE uses release-readiness. Do not start unrelated tasks.

## UI/UX and design guardrails
- Read existing design system and relevant UI evidence first; use `docs/design/` as persistent knowledge. Verify framework and component library; preserve existing stack, branding, business logic, authorization, accessibility and workflows. No framework migration or global redesign without explicitly authorized scope.
- Research current standards and relevant references only when needed; record source URL, access date, evidence and limitations. Trends are optional, not standards. Never copy protected assets or proprietary design.
- Establish tokens and reusable components before broad styling. Use semantic HTML, keyboard navigation, visible focus, accessible names, contrast, responsive layouts, reduced-motion preferences, and clear loading/empty/error/success states. Target WCAG 2.2 AA; do not claim conformance without evidence.
- Implement one bounded screen group or component family per cycle. Capture baseline and after screenshots if browser available, verify behavior and responsive layouts, and record untested items. Never claim visual tests passed without running them.
- Keep task checkpoints in existing V4 task files; update design docs only where relevant. Do not automatically redesign on ordinary feature or bugfix requests.
