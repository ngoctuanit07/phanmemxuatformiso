# UI Roadmap
**One bounded batch per cycle; preserve existing workflows.**
**Last updated:** 2026-11-25 | REDESIGN-004 complete

| Batch ID | Screen group | Acceptance criteria | Dependencies | Priority | Status |
|---|---|---|---|---|---|
| **REDESIGN-001** | Design tokens + PageHeader + StatsCard + Dashboard | globals.css has full token set; components exist; Dashboard uses them; build passes (21/21) | None | P0 | ✅ Done 2026-11-25 |
| **REDESIGN-002** | Users page + Roles page (admin screens) | Use PageHeader; replace `alert()` with AlertBanner component; aria-hidden on icons; build passes | REDESIGN-001 | P1 | ✅ Done 2026-11-25 |
| **REDESIGN-003** | Templates pages (regular, ISO, manage, upload) + fill | Use PageHeader; consistent card header pattern; LoadingSpinner component; build passes | REDESIGN-001 | P1 | ✅ Done 2026-11-25 |
| **REDESIGN-004** | Settings + Records + Print-logs | Use PageHeader + StatsCard (where applicable); EmptyState component; ConfirmModal component; build passes | REDESIGN-002/003 | P2 | ✅ Done 2026-11-25 |
| **REDESIGN-005** | Mobile sidebar drawer | Responsive hamburger → offcanvas drawer on <768px; keyboard-navigable; WCAG 2.2 AA | REDESIGN-003 | P2 | 🔲 Pending |
| **REDESIGN-006** | Live visual QA with browser | Browser screenshots at 375/768/1280px for all pages; aria audit; focus-ring check | REDESIGN-004 | P2 | 🔲 Pending |

## Decisions
- Framework: Bootstrap 5 stays; no migration.
- Component strategy: shared components in `components/`; CSS tokens in `app/globals.css`.
- Business logic: no changes to auth, RBAC, API routes or DB schema.
- Print layout: preserved as-is; no changes.
