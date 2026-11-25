---
name: visual-qa
description: Verify rendered UI, responsive behavior, accessibility and functional regressions.
---

# Visual Qa — V5

1. Use existing browser/test tooling if available. Start only a safe local environment; don't install tooling or access production without appropriate permission. Record URL, viewport, browser, date, commit and test data.
2. Capture before/after for affected screens and important shared layout routes at representative widths. Check overflow, clipping, wrapping, stacking, dialogs, keyboard navigation, focus, contrast, accessible names, reduced motion and error/empty/loading states.
3. Execute key interactions and relevant regression tests; inspect console/network failures without exposing secrets. Automated accessibility checks are partial; manual keyboard and screen-reader checks when available.
4. Record each test as PASS/FAIL/NOT_RUN with evidence and artifact paths in VISUAL_QA. If no browser, never fabricate screenshots or scores; document manual verification steps and remaining risk.
5. Fix scoped blockers if implementation mode allows; rerun affected checks. Audit mode reports only.
