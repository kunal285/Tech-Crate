# Tech Crate — Backend API Service

> **Central REST API Engine & Source of Truth**  
> Built with Node.js, Express.js, MongoDB (Mongoose), JWT, RBAC, and Razorpay.

---

## 1. Overview & Core Responsibilities

The backend API service is the authoritative source of truth for the entire Tech Crate ecosystem. It serves the Customer Website (Next.js), Customer Mobile App (React Native), and Admin Management Panel (Vite+React).

### Key Responsibilities
* **Authority Over Business Logic**: Calculates and verifies all product prices, taxes (GST 18%), delivery fees, discounts, and inventory availability.
* **Authentication & Authorization**: Issues JWT tokens, enforces password hashing via `bcryptjs`, and handles granular Role-Based Access Control (RBAC).
* **Payment Processing**: Integrates Razorpay order generation, signature verification, webhook processing, and Cash on Delivery (COD) workflows.
* **Inventory Management**: Tracks stock per product and variant, preventing overselling.
* **India Localization**: Calculates CGST (9%) + SGST (9%) or IGST (18%) with HSN codes, and supports Indian PIN code delivery verification.

---

## 2. Directory Structure

```
backend/
├── config/             # Database connection (db.js) & service credentials
├── controllers/        # Request handlers (auth, product, cart, order, admin, payment)
├── middleware/         # Security & request pipelines
│   ├── authMiddleware.js       # JWT validation & user attachment
│   ├── rbacMiddleware.js       # Granular roles (super_admin, store_manager, etc.)
│   ├── responseEnvelope.js     # Standard { success, data, meta } formatter
│   └── errorMiddleware.js      # Global error & Mongoose exception handler
├── models/             # Mongoose schemas (User, Product, Order, Cart, Category, etc.)
├── routes/             # Express route modules
│   ├── v1Router.js             # Canonical /api/v1 router aggregation
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   ├── checkoutRoutes.js
│   ├── paymentRoutes.js
│   └── adminRoutes.js
├── scripts/            # Database seeders & manual checkout testing scripts
├── tests/              # Jest + Supertest automated test suites
├── utils/              # Helper utilities (validateEnv.js, tokenGenerator.js)
├── server.js           # Server entry point & middleware pipeline
└── package.json        # Dependencies & scripts
```

---

## 3. API Versioning & Response Contract

### Dual Routing Architecture
* **Canonical API (`/api/v1/*`)**: The primary versioned API for all modern clients.
* **Legacy Compatibility (`/api/*`)**: Automatically mounted to ensure installed mobile app versions continue functioning smoothly without breaking changes.

### Standard Response Envelope
All endpoints use the standardized `responseEnvelope.js` middleware:

#### Success Response (`HTTP 200/201`)
```json
{
  "success": true,
  "data": {
    "orderId": "660c1d2e8b...",
    "total": 1499,
    "status": "Processing"
  },
  "meta": {
    "timestamp": "2026-10-11T00:15:00.000Z",
    "version": "v1"
  }
}
```

#### Error Response (`HTTP 4xx/5xx`)
```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Requested quantity exceeds available stock.",
    "requestId": "req_1728589200000_f9a812",
    "details": null
  }
}
```

---

## 4. Role-Based Access Control (RBAC)

The backend provides five granular administrative roles:

| Role | Permissions & Scope |
| :--- | :--- |
| `super_admin` | Unrestricted full system access; manages staff users and system configs. |
| `store_manager` | Manages products, categories, variants, inventory, and promotional coupons. |
| `order_staff` | Processes orders, marks dispatches, assigns courier tracking numbers. |
| `support` | Read-only order/customer inspection; handles return/replacement requests. |
| `finance` | Accesses invoices, revenue metrics, GST tax breakdowns, and refund reports. |

*Note: Legacy `'admin'` role strings in the database automatically map to `super_admin` permissions for complete backward compatibility.*

---

## 5. Environment Variables Configuration

Create a `.env` file in `backend/` before starting the server:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://127.0.0.1:27017/techcrate

# Authentication & Security
JWT_SECRET=your_ultra_secure_jwt_secret_minimum_32_characters_long
JWT_EXPIRES_IN=7d

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
RAZORPAY_KEY_SECRET=YourRazorpayKeySecretHere
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecretHere

# Cloudinary (Media & Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client URLs (CORS Whitelist)
CLIENT_URL=http://localhost:3001
ADMIN_URL=http://localhost:5173
```

---

## 6. Development & Testing Commands

```bash
# Install dependencies
npm install

# Start development server with Nodemon (auto-reload)
npm run dev

# Start production server
npm start

# Populate database with initial mock catalog & admin credentials
npm run seed

# Run automated Jest API integration tests
npx jest tests/

# Run specific checkout workflow verification script
npm run test:checkout
```

---

## 7. Key Canonical Endpoints Reference

* `GET  /api/v1/app-version` — Health check & client version compatibility
* `POST /api/v1/auth/register` — Customer registration
* `POST /api/v1/auth/login` — Customer/admin authentication
* `GET  /api/v1/products` — Catalog query with filtering, sorting, and pagination
* `GET  /api/v1/products/:id` — Single product details with variants and stock
* `GET  /api/v1/cart` — Retrieve customer's active server-side cart
* `POST /api/v1/cart/items` — Add item to cart with stock validation
* `POST /api/v1/checkout/initiate` — Create verified checkout session
* `POST /api/v1/payment/razorpay/order` — Create Razorpay order
* `POST /api/v1/payment/razorpay/verify` — Verify cryptographic signature & finalize order
* `GET  /api/v1/orders/my-orders` — Customer order history
* `GET  /api/v1/admin/dashboard` — Executive metrics (RBAC protected)
