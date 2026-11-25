# Design System — phanmemxuatformiso
**Status:** Initialized — REDESIGN-001 | 2026-11-25
**Stack:** Next.js 14 App Router + Bootstrap 5.3 + Bootstrap Icons 1.x
**Source of truth:** `app/globals.css` `:root` block

---

## Brand identity
| Property | Value | Notes |
|---|---|---|
| Product name | Phần Mềm Xuất Form Theo Mẫu ISO & In Ấn Local | Full title |
| Short name | XUẤT FORM ISO & IN ẤN | Used in Navbar brand |
| Primary industry | ISO document / form management | Internal enterprise tool |
| Language | Vietnamese (vi) | `lang="vi"` on `<html>` |

---

## Colour tokens (`:root` in `globals.css`)

### Brand colours
| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#1e3a8a` | Navy blue — primary actions, headings, active state |
| `--color-primary-hover` | `#1e40af` | Button hover |
| `--color-primary-light` | `#dbeafe` | Light bg tint (badges, subtle highlights) |
| `--color-secondary` | `#0f766e` | Teal — secondary actions |
| `--color-accent` | `#d97706` | Amber — highlights, "new" badges, printer icon |
| `--color-accent-light` | `#fef3c7` | Amber bg tint |

### Semantic status
| Token | Value | Usage |
|---|---|---|
| `--color-success` | `#16a34a` | Saved records, printed OK |
| `--color-success-bg` | `#dcfce7` | |
| `--color-warning` | `#d97706` | Print count, caution |
| `--color-warning-bg` | `#fef3c7` | |
| `--color-danger` | `#dc2626` | Delete, errors |
| `--color-danger-bg` | `#fee2e2` | |
| `--color-info` | `#0284c7` | Users, info |
| `--color-info-bg` | `#e0f2fe` | |

### Neutrals
| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#f8fafc` | Page background |
| `--color-surface` | `#ffffff` | Card / modal background |
| `--color-border` | `#e2e8f0` | Card & table borders |
| `--color-border-subtle` | `#f1f5f9` | Inner dividers, card-header bottom |
| `--color-text` | `#1e293b` | Body copy |
| `--color-text-muted` | `#64748b` | Secondary text |
| `--color-text-secondary` | `#94a3b8` | Sidebar section headers |

### Sidebar
| Token | Value |
|---|---|
| `--sidebar-bg` | `#0f172a` |
| `--sidebar-link` | `#cbd5e1` |
| `--sidebar-link-hover-bg` | `rgba(255,255,255,0.08)` |
| `--sidebar-active-bg` | `#2563eb` |
| `--sidebar-header-color` | `#64748b` |

---

## Typography
| Token | Value | Usage |
|---|---|---|
| `--font-family-base` | system-ui stack | Body |
| `--font-size-xs` | `0.72rem` | Nav section headers, tiny badges |
| `--font-size-sm` | `0.8rem` | Sidebar links small text |
| `--font-size-label` | `0.85rem` | Table `th`, badge labels |
| `--font-size-base` | `1rem` | Body |
| `--line-height-base` | `1.5` | |

Bootstrap utility overrides: `.fs-7` = `0.8rem`, `.fs-8` = `0.72rem` (added in globals.css as Bootstrap 5 ships only fs-1–fs-6).

---

## Spacing
| Token | Value |
|---|---|
| `--space-xs` | `0.25rem` |
| `--space-sm` | `0.5rem` |
| `--space-md` | `1rem` |
| `--space-lg` | `1.5rem` |
| `--space-xl` | `2rem` |

---

## Border radii
| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `0.25rem` | Small badges |
| `--radius-md` | `0.5rem` | Cards, inputs, nav links |
| `--radius-lg` | `0.75rem` | Larger panels |
| `--radius-xl` | `1rem` | Login card (`rounded-4`) |
| `--radius-pill` | `9999px` | Pill badges |

---

## Shadows
| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px 0 rgba(0,0,0,0.05)` | Minimal lift |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.07)…` | Default card shadow |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.08)…` | Hover / modal elevation |

---

## Component inventory

### Shared components (components/)
| Component | Path | Purpose | Status |
|---|---|---|---|
| AppLayout | `components/AppLayout.js` | Root layout: login vs authenticated shell | Existing |
| Navbar | `components/Navbar.js` | Top navigation with user dropdown | Existing |
| Sidebar | `components/Sidebar.js` | Left nav with RBAC-gated links | Existing |
| BootstrapClient | `components/BootstrapClient.js` | Bootstrap JS hydration | Existing |
| **PageHeader** | `components/PageHeader.js` | Standardised page title + subtitle + actions | ✅ NEW |
| **StatsCard** | `components/StatsCard.js` | KPI / metric card for dashboards | ✅ NEW |
| TemplateList | `components/TemplateList.js` | Template list shared by /templates/* | Existing |
| FqcTestingForm | `components/FqcTestingForm.js` | FQC form component | Existing |

### PageHeader props
| Prop | Type | Required | Description |
|---|---|---|---|
| `icon` | string | No | Bootstrap Icon class e.g. `bi-speedometer2` |
| `title` | string | Yes | Page heading (h3) |
| `subtitle` | string | No | Muted sub-text |
| `actions` | ReactNode | No | Buttons / links right-aligned |
| `className` | string | No | Extra class on wrapper |

### StatsCard props
| Prop | Type | Required | Description |
|---|---|---|---|
| `label` | string | Yes | Metric label (uppercase small) |
| `value` | number/string | Yes | Numeric value |
| `icon` | string | Yes | Bootstrap Icon class |
| `variant` | string | No | `primary`\|`success`\|`warning`\|`danger`\|`info`\|`secondary` |
| `subtext` | string | No | Description below value |
| `subtextIcon` | string | No | Icon for subtext |
| `loading` | boolean | No | Shows skeleton placeholder |
| `href` | string | No | Wraps card in Next.js `<Link>` |

---

## Utility CSS classes (globals.css)
| Class | Description |
|---|---|
| `.page-header` | Standardised page title bar wrapper |
| `.page-header-title` | h3 style with icon alignment |
| `.page-header-subtitle` | Muted subtitle |
| `.page-header-actions` | Button row (right-aligned) |
| `.table-custom` | Styled table (vertical-align middle) |
| `.stat-card-{variant}` | Left-border accent for metric cards |
| `.hover-shadow` | Lift animation on hover |
| `.transition` | Base transition on all properties |
| `.badge-code` | Monospace code badge |
| `.badge-status` | Uppercase status badge |
| `.fs-7` | 0.8rem font size |
| `.fs-8` | 0.72rem font size |

---

## Bootstrap override policy
- Bootstrap primary is overridden to `var(--color-primary)` (#1e3a8a navy) via `.btn-primary`, `.bg-primary`, `.text-primary`, `.border-primary`, `.btn-outline-primary` in globals.css.
- Do NOT set Bootstrap `--bs-primary` custom property in JS; use the CSS override pattern instead to avoid SSR hydration mismatches.
- Keep Bootstrap utility classes (responsive grid, flex, spacing, display) — do not replace with custom equivalents.

---

## Accessibility baseline
- Focus rings: `:focus-visible` with 2px navy outline + 2px offset (WCAG 2.2 AA).
- Icon usage: decorative icons must have `aria-hidden="true"`.
- Interactive icons must have `aria-label` or visible text label.
- Colour contrast: primary navy on white = 9.4:1 ✅ WCAG AA.
- Form inputs: always have `<label>` with `for`/`htmlFor`.
- **Target:** WCAG 2.2 AA — not yet fully verified (see VISUAL_QA.md).

---

## Decisions & migration scope
- **REDESIGN-001 scope (this batch):** Design tokens, PageHeader component, StatsCard component, Dashboard refactored to use both.
- **Not in scope:** Framework migration (Bootstrap stays), page-level full redesigns, login page changes, print layout.
- **Deferred (Batch 2):** Refactor Users, Settings, Templates pages to use PageHeader. Add LoadingSpinner, EmptyState, AlertBanner shared components.
- **Deferred (Batch 3):** Responsive mobile sidebar drawer, dark mode tokens.
