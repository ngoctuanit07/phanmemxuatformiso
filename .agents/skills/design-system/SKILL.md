---
name: design-system
description: Create or evolve reusable design tokens and component rules without changing stack.
---

# Design System — V5

1. Read existing tokens, CSS/theme and component library; preserve brand and framework. If Bootstrap exists, prefer its variables/utilities rather than adding Tailwind.
2. Define semantic colors (surface, text, border, primary, status), type scale, spacing, radius, elevation, breakpoints, focus and motion. Reuse supported tokens; include light/dark only if in scope. Record actual values and source files in DESIGN_SYSTEM.
3. Inventory buttons, forms, tables, cards, nav, modals, alerts and states in COMPONENT_MATRIX; prefer existing components and accessible primitives.
4. Verify contrast (normal text 4.5:1, large text 3:1; applicable non-text 3:1), keyboard and responsive behavior. Target WCAG 2.2 AA, not blanket compliance claims.
5. Establish migration sequence and a small representative screen before changing shared styles; list affected routes and rollback plan. No blanket stylesheet rewrite.
