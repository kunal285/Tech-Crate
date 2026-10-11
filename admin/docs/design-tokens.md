# Tech Crate Admin Design Tokens Reference

This document maps all design tokens in the Admin Panel directly to the Tech Crate customer storefront (`website/`) and mobile application (`mobile/src/theme/`).

---

## 1. Brand Palette & Color Scale

| Token Name | Hex Value | Storefront Reference | Usage in Admin Panel |
| :--- | :--- | :--- | :--- |
| `brand.navy` | `#032762` | `website/src/theme/tokens.js: BRAND.navy` | Top Brand Header, primary titles, section headings |
| `brand.secondaryBlue` | `#034697` | `website/src/theme/tokens.js: BRAND.secondaryBlue` | Secondary button hover, active sidebar indicator |
| `brand.blue` | `#0262B8` | `website/src/theme/tokens.js: BRAND.blue` | Table links, secondary interactive elements |
| `brand.primary` | `#2563EB` | `website/src/theme/tokens.js: BRAND.primary` | Primary action buttons, active tabs, focus ring |
| `brand.primaryDark` | `#1D4ED8` | `website/src/theme/tokens.js: BRAND.primaryDark` | Primary button hover / active state |
| `brand.primaryLight`| `#DBEAFE` | `website/src/theme/tokens.js: BRAND.primaryLight` | Subtle badge backgrounds, selected row fills |
| `brand.orange` | `#F97316` | `website/src/theme/tokens.js: BRAND.orange` | Warning badges, active counters, attention alerts |
| `brand.purple` | `#7C3AED` | `website/src/theme/tokens.js: BRAND.secondary` | Project kits, DIY components tag |
| `brand.cyan` | `#02C9CC` | `website/src/theme/tokens.js: BRAND.cyan` | AI diagnostics, live telemetry badges |
| `brand.darkNavy` | `#061A3A` | `website/src/theme/tokens.js: BRAND.darkNavy` | Dark mode high-contrast sidebar surface |

---

## 2. Canvas & Surfaces (Light / Dark)

| Role | Light Theme Value | Dark Theme Value | CSS Variable |
| :--- | :--- | :--- | :--- |
| **Canvas** | `#F8FAFC` (`slate-50`) | `#0B1120` (`slate-950` deep) | `--bg-canvas` |
| **Card / Surface** | `#FFFFFF` | `#0F172A` (`slate-900`) | `--bg-surface` |
| **Muted Surface** | `#F1F5F9` (`slate-100`) | `#1E293B` (`slate-800`) | `--bg-muted` |
| **Sidebar Surface**| `#FFFFFF` | `#060D1A` | `--bg-sidebar` |
| **Header Surface** | `rgba(255,255,255,0.9)` | `rgba(15,23,42,0.9)` | `--bg-header` |

---

## 3. Typography

* **Primary Body & Headings**: `Outfit` (sans-serif) loaded via `next/font/google`.
* **Monospace / Tabular Data**: `JetBrains Mono` for SKU numbers, tracking codes, timestamps, order amounts (`₹`), and JSON specs.
* **Weights**: Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800).

---

## 4. Semantic Status Badges (Dot + Soft Fill + High Contrast Text)

| Status | Badge Background | Text Color | Dot Color |
| :--- | :--- | :--- | :--- |
| **Placed / Open** | `bg-sky-50 dark:bg-sky-950/40` | `text-sky-700 dark:text-sky-300` | `bg-sky-500` |
| **Confirmed** | `bg-indigo-50 dark:bg-indigo-950/40` | `text-indigo-700 dark:text-indigo-300` | `bg-indigo-500` |
| **Packed** | `bg-purple-50 dark:bg-purple-950/40` | `text-purple-700 dark:text-purple-300` | `bg-purple-500` |
| **Shipped** | `bg-blue-50 dark:bg-blue-950/40` | `text-blue-700 dark:text-blue-300` | `bg-blue-500` |
| **Out for Delivery** | `bg-cyan-50 dark:bg-cyan-950/40` | `text-cyan-700 dark:text-cyan-300` | `bg-cyan-500` |
| **Delivered** | `bg-emerald-50 dark:bg-emerald-950/40`| `text-emerald-700 dark:text-emerald-300`| `bg-emerald-500` |
| **Cancelled** | `bg-rose-50 dark:bg-rose-950/40` | `text-rose-700 dark:text-rose-300` | `bg-rose-500` |
| **Returned** | `bg-orange-50 dark:bg-orange-950/40` | `text-orange-700 dark:text-orange-300` | `bg-orange-500` |
| **Refunded** | `bg-violet-50 dark:bg-violet-950/40` | `text-violet-700 dark:text-violet-300` | `bg-violet-500` |

---

## 5. Recharts Colorblind-Safe Analytics Palette

Exposed via CSS variables `--chart-1` through `--chart-6` to render consistently in light and dark mode:

1. `--chart-1`: `#034697` (Light) / `#38BDF8` (Dark) — Primary Revenue Series
2. `--chart-2`: `#F97316` (Light) / `#FB923C` (Dark) — Orders / Units Sold
3. `--chart-3`: `#7C3AED` (Light) / `#A78BFA` (Dark) — Project Kits & Bundles
4. `--chart-4`: `#02C9CC` (Light) / `#2DD4BF` (Dark) — Electronics Components
5. `--chart-5`: `#10B981` (Light) / `#34D399` (Dark) — Successful Deliveries
6. `--chart-6`: `#F59E0B` (Light) / `#FBBF24` (Dark) — Returns / Processing
