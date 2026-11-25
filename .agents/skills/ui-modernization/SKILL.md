---
name: ui-modernization
description: Redesign one approved screen group or component family using the existing stack and design system.
---

# Ui Modernization — V5

1. Read AGENTS, active task, audit and design system; establish explicit scope and acceptance criteria. If full redesign requested, create UI_ROADMAP and execute one bounded batch at a time.
2. Discover layout and dependency paths, inspect only affected code. Preserve navigation semantics, authorization, validation, API contracts, business logic and existing functionality. Avoid framework changes or new dependencies without justification and authorization for major changes.
3. Apply tokens, reusable components, consistent spacing and hierarchy. Address responsive tables, forms, empty/loading/error/success states, keyboard interaction, focus and reduced motion. Keep important actions visible; avoid decorative clutter.
4. Run relevant build/tests and visual-qa. Review diff; check key flows and shared layout regressions. If visual tooling unavailable, label unverified and give manual steps.
5. Update design docs, task state, handoff and Graphify only if graph inputs changed. Stop at batch boundary; record next screen. Never equate a screenshot with functioning UI.
