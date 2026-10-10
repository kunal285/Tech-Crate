# Tech Crate — Admin Management Panel

> **Enterprise Operations & Store Management Web Dashboard**  
> Built with Next.js (App Router), React 18, Tailwind CSS, Recharts, and Lucide Icons.  
> 100% Visual and Design Token Parity with the Tech Crate Customer Storefront (`website/`).

---

## 1. Overview & Architecture

The Tech Crate Admin Web Panel provides privileged management for store administrators, managers, and fulfillment staff to oversee catalog management, track live orders, inspect analytics, audit replacement claims, and manage vendor operations.

### Key Capabilities
* **Storefront Design System Parity**: Built using the exact same tokens as `website/` (Brand Navy `#032762`, Brand Blue `#2563EB`, Accent Orange `#F97316`, `Outfit` headings and body font, and `JetBrains Mono` for tabular data, currencies, and SKUs).
* **Light / Dark Theme Support**: Light default matching the storefront with instant dark mode switcher persisted in `localStorage` with zero flash-of-unstyled-content (FOUC).
* **Collapsible & Grouped Sidebar Navigation**:
  * **Overview**: Dashboard, Analytics
  * **Catalog**: Products & Inventory, Categories, Projects & Kits, Reviews
  * **Sales & Operations**: Orders, Replacement Claims, Payments
  * **Marketplace**: Sellers & Vendors
  * **Marketing**: Coupons, Banners, Push Notifications
  * **Administration**: Users & Roles, Platform Settings
* **Component Library (`src/components/ui/`)**: Accessible, dense operational primitives (`Button`, `Input`, `Select`, `Textarea`, `Checkbox`, `Switch`, `Badge`, `StatusBadge`, `Card`, `StatCard`, `DataTable`, `Modal`, `ConfirmDialog`, `Tabs`, `EmptyState`).
* **Design Kit Route**: Dedicated dev route at [`/ui-kit`](http://localhost:5173/ui-kit) showcasing all components, states, and variants in both light and dark modes.
* **Role-Aware Landing Navigation**:
  * `order_staff` -> `/orders`
  * `finance` -> `/payments`
  * `support` -> `/replacements`
  * `store_manager` -> `/products`
  * `super_admin` / `admin` -> `/dashboard`
* **Logistics & Tax Compliance**:
  * Courier partner assignment (Delhivery, Shiprocket, BlueDart, DTDC, India Post) with auto-generated tracking URLs.
  * Print-friendly statutory GST Tax Invoice (GSTIN, HSN 8542, CGST/SGST, and IGST breakdowns).

---

## 2. Directory Structure

```
admin/
├── docs/
│   └── design-tokens.md        # Complete token reference mapped to storefront
├── public/                     # Static brand assets and icons
├── src/
│   ├── app/                    # Next.js App Router structure
│   │   ├── layout.jsx          # Root layout (Outfit & JetBrains Mono, Theme script)
│   │   ├── page.jsx            # Root redirect to /dashboard
│   │   ├── globals.css         # Design tokens, CSS variables, and light/dark themes
│   │   ├── not-found.jsx       # 404 handler
│   │   ├── error.jsx           # Error boundary
│   │   ├── access-denied/      # 403 Forbidden page for restricted roles
│   │   ├── login/              # Admin login page with TOTP 2FA & role landing
│   │   ├── (dashboard)/        # Protected dashboard shell
│   │   │   ├── layout.jsx      # Sidebar & Header shell with a11y skip link
│   │   │   ├── loading.jsx     # Route skeleton loader
│   │   │   ├── page.jsx        # Executive dashboard analytics
│   │   │   ├── ui-kit/         # Component library preview route
│   │   │   ├── products/       # Product catalog, create, edit, approvals
│   │   │   ├── orders/         # Order fulfillment pipeline & order details
│   │   │   ├── replacements/   # 7-day replacement claim queue
│   │   │   ├── categories/     # Category taxonomy
│   │   │   ├── coupons/        # Promotional discounts
│   │   │   ├── users/          # User accounts & role management
│   │   │   ├── sellers/        # Marketplace sellers & approvals
│   │   │   ├── projects/       # Engineering project kits & BOM
│   │   │   ├── payments/       # Transaction revenue logs
│   │   │   ├── reviews/        # Customer feedback & ratings
│   │   │   ├── banners/        # Carousel banner posters
│   │   │   ├── notifications/  # Push notifications
│   │   │   ├── analytics/      # High-density operational charts
│   │   │   └── settings/       # Store & platform configurations
│   │   └── api/                # Route handlers (auth, proxy, upload)
│   ├── components/             # Shell and layout components
│   │   ├── Header.jsx          # Sticky header with search, notifications, theme toggle
│   │   ├── Sidebar.jsx         # Grouped collapsible rail navigation (76px / 256px)
│   │   ├── PageHeader.jsx      # Standardized title, breadcrumb, and action slots
│   │   ├── ThemeToggle.jsx     # Light/Dark mode switcher
│   │   └── ui/                 # Reusable operational component library
│   ├── constants/              # RBAC roles & permissions
│   ├── services/               # API clients with auto cache-busting
│   ├── store/                  # Zustand authentication state
│   └── views/                  # Modular view page implementations
```

---

## 3. Getting Started & Scripts

### Prerequisites
* Node.js v18+ (tested on Node.js v20+)
* npm v9+

### Environment Configuration
Ensure `.env` contains:
```env
# Backend API URL (for server-side proxy route handlers)
NEXT_PUBLIC_API_URL=https://tech-crate.onrender.com/api
# Or local dev: NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Start local development server (runs on port 5173)
npm run dev

# 3. Production build verification
npm run build

# 4. Production start
npm run start

# 5. Code lint verification
npm run lint
```

Access the panel at:
* **Admin Dashboard**: `http://localhost:5173/dashboard`
* **Component Library (UI Kit)**: `http://localhost:5173/ui-kit`
* **Default Credentials**: `admin@techcrate.com` / `password123`
