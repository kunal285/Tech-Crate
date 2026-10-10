# Tech Crate — Admin Management Panel

> **Enterprise Operations & Store Management Web Dashboard**  
> Built with React 18, Vite 5, React Router v6, Tailwind CSS, Recharts, and Lucide Icons.

---

## 1. Overview & Capabilities

The Tech Crate Admin Web Panel is a dedicated portal for store administrators, managers, and fulfillment staff to oversee catalog management, track live orders, inspect analytics, and manage customer operations.

### Key Capabilities
* **Interactive Business Dashboard**: Real-time sales summaries, total revenue, average order value (AOV), pending dispatches, and recent order feeds visualized via Recharts.
* **Catalog & Inventory Management**:
  * Create, update, and categorize electronic components, kits, and accessories.
  * Multi-variant handling (voltage, package, sensor version) with individual SKU and stock tracking.
  * Low-stock warnings and out-of-stock badges.
  * Image upload and Cloudinary media management.
* **Order Processing & Fulfillment Hub**:
  * Filter orders by status: `Placed`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled`.
  * Update order lifecycle and assign courier partners (Delhivery, BlueDart, India Post) with tracking IDs.
  * Generate and print official GST Tax Invoices.
* **Return & Replacement Claims**: Inspect customer claims under the 7-day replacement policy, verify test notes, and approve or reject claims.
* **Promotions & Marketing**: Create percentage/flat discount coupons, minimum purchase rules, and update homepage promotional banners.
* **Role-Based Access Control (RBAC)**: Interface permission gating tailored for specific staff duties.

---

## 2. Directory Structure

```
admin/
├── public/                 # Static brand assets and icons
├── src/
│   ├── components/         # Reusable dashboard UI components
│   │   ├── Navbar.jsx      # Top navigation with profile dropdown & notifications
│   │   ├── Sidebar.jsx     # Navigation sidebar with permission-filtered links
│   │   ├── StatCard.jsx    # Metric counter card with trend indicators
│   │   └── Modal.jsx       # Dialogs for order updates, product creation, etc.
│   ├── context/            # AuthContext, ThemeContext, AdminState
│   ├── pages/              # Main dashboard views
│   │   ├── Dashboard.jsx   # Revenue analytics, order volume graphs, quick stats
│   │   ├── Products.jsx    # Product list, search, filter, and stock levels
│   │   ├── ProductForm.jsx # Add / Edit product with variants, specs, and photos
│   │   ├── Orders.jsx      # Order fulfillment pipeline & tracking updates
│   │   ├── OrderDetail.jsx # Deep order inspection, line items, customer address
│   │   ├── Replacements.jsx# 7-day replacement claim processing queue
│   │   ├── Categories.jsx  # Category taxonomy management
│   │   ├── Coupons.jsx     # Discount coupon generator and usage limits
│   │   ├── Users.jsx       # Customer list and staff role assignment (Super Admin)
│   │   └── Login.jsx       # Secure administrative staff authentication
│   ├── services/           # Axios client configured with JWT interceptors
│   ├── utils/              # Currency formatters (INR), date helpers, validation
│   ├── App.jsx             # React Router routing configuration with ProtectedRoute
│   └── main.jsx            # React root mount
├── vite.config.js          # Vite build & proxy settings
└── package.json            # Dependencies & scripts
```

---

## 3. Role-Based Access Control (RBAC) in Admin UI

The navigation sidebar and page actions dynamically adapt according to the logged-in user's role:

| Role | Permitted Sections in Admin Panel |
| :--- | :--- |
| **`super_admin`** | Full access: Dashboard, Products, Orders, Replacements, Categories, Coupons, Users & Staff Management, System Settings. |
| **`store_manager`** | Catalog access: Products, Categories, Stock, Coupons, and Dashboard Analytics. |
| **`order_staff`** | Fulfillment access: Orders list, dispatch updates, tracking number assignment, and shipping labels. |
| **`support`** | Customer assistance: Order lookup, customer queries, and processing 7-day replacement claims. |
| **`finance`** | Financial records: Invoices, GST tax summaries, revenue charts, and refund processing records. |

---

## 4. Environment Variables Configuration

Create a `.env` file in `admin/`:

```env
# Backend API Base URL
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 5. Development & Production Commands

```bash
# Navigate to admin directory
cd admin

# Install dependencies
npm install

# Start Vite development server on port 5173
npm run dev

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 6. Security Best Practices for Admin Access

* Administrative accounts should always be granted least-privilege roles (e.g., dispatch operators receive `order_staff`, not `super_admin`).
* Tokens are verified against the backend RBAC middleware on every restricted API call.
* Unauthorized routes automatically redirect to an "Access Denied" view or the Login screen.
