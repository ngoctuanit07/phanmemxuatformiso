# Component Matrix — phanmemxuatformiso
**Updated:** 2026-11-25 | REDESIGN-001

| Component | Source path | Variants / states | Accessibility | Reuse / gap | Status |
|---|---|---|---|---|---|
| AppLayout | `components/AppLayout.js` | login layout / authenticated shell | None critical | Used in root layout | Existing ✓ |
| Navbar | `components/Navbar.js` | user logged in / guest | Missing `aria-label` on some icons | Used globally | Existing — minor fixes pending |
| Sidebar | `components/Sidebar.js` | RBAC-gated links; active state | `aria-hidden` missing on icons | Used globally | Existing — minor fixes pending |
| BootstrapClient | `components/BootstrapClient.js` | — | — | Singleton | Existing ✓ |
| **PageHeader** | `components/PageHeader.js` | with/without icon; with/without actions | `aria-hidden` on icon; semantic `<h3>` | Dashboard, Users, Roles, Templates, Fill, Settings, Records, Print-logs migrated | ✅ NEW |
| **StatsCard** | `components/StatsCard.js` | 6 colour variants; loading skeleton; with/without href link | `aria-hidden` on icon | Dashboard, Records (3 KPI cards) migrated | ✅ NEW |
| **AlertBanner** | `components/AlertBanner.js` | `success` \| `danger` \| `warning` \| `info`; dismissible | `role="alert"`, `aria-hidden` on icon, `aria-label` on close | Users, Roles, Templates manage/upload, Settings, Records migrated | ✅ NEW |
| **LoadingSpinner** | `components/LoadingSpinner.js` | `md` \| `sm`; block or `inline`; custom message | `role="status"`, `aria-hidden` on spinner, `visually-hidden` fallback | TemplateList, Templates manage, Fill, Records, Print-logs migrated | ✅ NEW |
| **EmptyState** | `components/EmptyState.js` | icon, title, description, optional action | `aria-hidden` on icon | Records, Print-logs migrated | ✅ NEW |
| **ConfirmModal** | `components/ConfirmModal.js` | `danger` \| `warning` \| `primary`; loading state | `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-label` on close | Records (single & batch delete) migrated | ✅ NEW |
| TemplateList | `components/TemplateList.js` | regular / iso types | Unchecked | Used by /templates/regular, /templates/iso | Existing |
| FqcTestingForm | `components/FqcTestingForm.js` | — | Unchecked | Used internally | Existing |

## Missing / planned shared components (Batch 2+)
| Planned component | Priority | Purpose |
|---|---|---|
| `DataTable` | Low | Sortable, searchable table wrapper |
