# UI Audit — REDESIGN-001
**Status:** Completed — 2026-11-25
**Method:** Static source-code audit (no live browser; server not started during audit)

---

## Findings

| ID | Screen / Component | Severity | Issue | Recommendation | Status |
|---|---|---|---|---|---|
| A-01 | globals.css | High | Only 6 CSS custom properties; no spacing, typography, or shadow tokens; hard-coded hex values throughout components | Expand `:root` block with full token set | ✅ Fixed REDESIGN-001 |
| A-02 | Navbar.js | Medium | `bg-primary` uses Bootstrap default blue (#0d6efd) instead of brand navy (#1e3a8a) | Override Bootstrap primary in globals.css; apply `style` or token | ✅ Fixed REDESIGN-001 |
| A-03 | Dashboard (page.js) | Medium | 110-line inline stats card blocks repeated 5x; no shared component | Extract `StatsCard` component | ✅ Fixed REDESIGN-001 |
| A-04 | All pages | Medium | Page header pattern (title + subtitle + actions) is duplicated inline across every page with inconsistent structure | Extract `PageHeader` component | ✅ Fixed REDESIGN-001 (Dashboard done; others Batch 2) |
| A-05 | Sidebar.js | Low | `style={{ fontSize: '0.75rem' }}` inline; border radius uses hardcoded `0.375rem` | Migrate to CSS token classes | Deferred Batch 2 |
| A-06 | Navbar.js | Low | `style={{ width: 36, height: 36 }}` for avatar inline | CSS class `.navbar-avatar` with token | Deferred Batch 2 |
| A-07 | login/page.js | Low | `style={{ fontSize: '0.65rem' }}` on badge in sidebar template | badge-code class | Deferred Batch 2 |
| A-08 | Multiple pages | Low | `hover-shadow`, `transition` classes referenced in templates but not defined in CSS | Added to globals.css | ✅ Fixed REDESIGN-001 |
| A-09 | Sidebar badges | Low | Inline `style={{ fontSize: '0.65rem' }}` on "MỚI" / "QUẢN LÝ" badges | Use `.badge-status` / `.fs-8` class | Deferred Batch 2 |
| A-10 | All pages | Low | Decorative Bootstrap icons lack `aria-hidden="true"` attribute | Add `aria-hidden` on all decorative icons | Partial (PageHeader + StatsCard fixed; others Batch 2) |
| A-11 | Navbar quick-login | Info | Development-only "Quick Login" and "Role Switcher" blocks are commented-out inline | Move to .env-gated dev utility | Deferred |
| A-12 | globals.css table | Low | `table-custom td` has no `border-color` or `vertical-align` rule | Added `border-color` and `vertical-align: middle` | ✅ Fixed REDESIGN-001 |

---

## Coverage and limitations
- Audit method: static JS/CSS source-code review; no visual screenshots taken (browser not started).
- Pages covered: layout.js, globals.css, AppLayout, Navbar, Sidebar, Dashboard (page.js), login/page.js, settings/page.js (header pattern only).
- Pages NOT audited: fill, records, templates, users, roles, products, orders, print-logs (Batch 2).
- Accessibility: colour contrast tokens verified by calculation; keyboard navigation and screen-reader compliance not verified (requires live browser test).
- Mobile responsiveness: responsive grid classes are correct (Bootstrap col breakpoints used consistently); sidebar on mobile requires a drawer mechanism (not yet implemented).
