# Design Research
**Status:** Completed for REDESIGN-001 scope | 2026-11-25

> Separate standards from trends and opinions. Do not copy protected assets.

| Source URL | Access date | Observed pattern / requirement | Applicability | Verified? |
|---|---|---|---|---|
| https://www.w3.org/TR/WCAG22/ | 2026-11-25 | WCAG 2.2 AA: focus-visible must be visible (SC 2.4.11), colour contrast 4.5:1 for text (SC 1.4.3) | Applied: `:focus-visible` rule added; primary #1e3a8a on white = 9.4:1 contrast | Static calc ✓ |
| Bootstrap 5 docs (getbootstrap.com) | 2026-11-25 | Bootstrap 5 ships `fs-1` through `fs-6` only; `fs-7` not available | Applied: added `.fs-7 { font-size: 0.8rem }` and `.fs-8` to globals.css | ✓ |
| Bootstrap 5 docs — custom properties | 2026-11-25 | `--bs-primary` can be overridden but causes SSR hydration risk in Next.js; prefer CSS class overrides | Applied: used `.btn-primary`, `.bg-primary` selector overrides in globals.css instead of `--bs-primary` | ✓ |
| Tailwind CSS colour palette reference | 2026-11-25 | Slate-900 (#0f172a) used by sidebar-bg; Blue-800 (#1e40af) used by primary-hover; these align with existing hardcoded values in source | Used as reference for token value selection only; no Tailwind dependency added | Reference only |

## Notes
- Research limited to standards directly applicable to REDESIGN-001 scope.
- No competitor UI was copied or referenced for direct design imitation.
- Bootstrap upgrade from 5.3.x not evaluated — not in scope.
