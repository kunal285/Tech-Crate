# 🛒 Tech Crate - Full-Stack E-Commerce & Student Project Ecosystem

Welcome to **Tech Crate**, an end-to-end e-commerce and engineering project platform comprising a high-performance **Node.js/Express REST API**, a modern **React + Vite Admin Control Panel**, and a **React Native Mobile App** tailored for students, makers, and electronics enthusiasts.

---

## 🌟 Key Platform Features

### 1. 📦 Advanced Product Management System
- **Comprehensive Product Details:** Full support for product **Title**, detailed **Description**, and category classification.
- **Key Features & Bullet Points:** Dynamic bullet-point feature highlights (e.g., technical specifications, pinout ratings, clock speeds) rendered with checkmarks on mobile.
- **Smart Discount Pricing Engine:**
  - Base MRP / List Price (`originalPrice`).
  - Discounted / Selling Price (`discountedPrice`).
  - Effective Checkout Price (`price`).
  - Real-time automatic discount percentage badge computation (`-XX% OFF`) and customer savings indicator.
- **4 Dedicated Image Slots per Product:**
  - **Slot 1:** Main Cover / Hero Image
  - **Slot 2:** Detail / Angle View
  - **Slot 3:** Pinout / Technical Schematic
  - **Slot 4:** In-Hand / Packaging View
  - Direct file upload support (via Multer/Cloudinary) and direct image URL input with instant preview.
- **Interactive Mobile Gallery:** Interactive 4-thumbnail gallery switcher on the mobile product detail screen.

---

### 2. 🎨 Dynamic Promotional Poster & Banner Carousel
- **100% Admin Managed:** Create, edit, toggle, reorder, and remove promotional banners directly from the Admin Panel (`/posters`).
- **Custom Text & Action Overlays:**
  - Dynamic Headline / Title
  - Supporting Subtitle / Description
  - Call-To-Action (CTA) Button with custom label
  - Deep-link navigation target (e.g. `/products`, `/category/iot`, or custom link)
  - Custom badge tag (e.g. `LIMITED DEAL`, `FEATURED`)
  - Adjustable text alignment and dark overlay gradient for maximum readability.
- **Mobile Live Carousel:** Auto-sliding horizontal carousel on the mobile Home Screen with pagination dots and touch-responsive deep-linking.

---

### 3. ☀️ Dynamic Contextual Greetings
- Mobile Home Screen dynamically reflects the user's local time with personalized greetings:
  - **Good Morning 🌅** (05:00 – 11:59)
  - **Good Afternoon ☀️** (12:00 – 16:59)
  - **Good Evening 🌆** (17:00 – 20:59)
  - **Good Night 🌙** (21:00 – 04:59)

---

### 4. 🔐 Multi-Factor Authentication & Verification
- **Mobile-First Passwordless SMS OTP:**
  - Quick, frictionless sign-in using `+91 Mobile Number` + `6-Digit Cryptographic OTP`.
  - SHA-256 hashed storage in MongoDB with 5-minute auto-expiry via TTL indexes.
  - Rate limiting with 30-second resend cooldowns, captcha verification (`CaptchaBox`), and brute-force lockouts.
- **Firebase Authentication & Social Sign-In:**
  - Integrated via `@react-native-google-signin/google-signin` and Firebase Authentication SDKs with server-side token validation.
- **Strict Admin Portal Isolation:**
  - Isolated admin authentication route at `POST /api/auth/login`.
  - Admin accounts cannot be accessed via customer OTP routes; privilege escalation is blocked server-side.

---

### 5. 💳 Payments, Cart & Order Fulfillment
- **Integrated Payment Gateway:** Payment controller integration supporting online transactions and checkout workflows.
- **Cart & Wishlist Sync:** Real-time Zustand store synchronization for mobile cart and wishlist.
- **Full Order Lifecycle Management:** Complete tracking from `Pending` -> `Processing` -> `Shipped` -> `Delivered` / `Cancelled`.

---

### 6. 🛡️ Enterprise Security, Audit & Observability
- **Zod Schema Validation:** Runtime input validation middleware protecting API parameters.
- **Audit Logging Service:** Tracks security events, admin actions, and authentication attempts (`AuditLog`).
- **Error Tracking & Telemetry:** Sentry instrumentation for exception capturing and performance monitoring.
- **Dual Database Architecture Support:** MongoDB Mongoose schemas alongside relational SQL schema for Supabase deployment (`supabase_schema.sql`).
- **OpenAPI 3.0 Documentation:** Interactive API documentation schema defined in `backend/docs/openapi.json`.

---

## 🔑 Default Administrator Credentials

For accessing the Admin Web Panel:

| Property | Value |
| :--- | :--- |
| **Admin URL** | [http://localhost:3000](http://localhost:3000) |
| **Username / Email** | `admin` *(or `admin@techcrate.com`)* |
| **Password** | `password123` |
| **Role** | `admin` (Full catalog, poster, order, and user management) |

---

## 🏗️ Repository Architecture

```text
TechCrate/
├── backend/                  # Node.js + Express REST API Server
│   ├── config/               # DB, Cloudinary, Firebase, and Sentry configuration
│   ├── controllers/          # Controllers (auth, product, poster, order, payment, admin)
│   ├── database/             # Relational schemas (supabase_schema.sql)
│   ├── docs/                 # OpenAPI 3.0 specification (openapi.json)
│   ├── middleware/           # WAF, JWT authorization, rate limiters, Zod validation
│   ├── models/               # Mongoose schemas (Product, Poster, User, Order, AuditLog, Coupon)
│   ├── routes/               # API route definitions (/api/products, /api/posters, /api/payments, etc.)
│   ├── scripts/              # Security and ecommerce audit test suites & seeding scripts
│   ├── services/             # Audit, Cache, Queue, and Email services
│   ├── validators/           # Zod schema definitions
│   └── server.js             # Main server entrypoint
│
├── admin/                    # React 18 + Vite Web Management Panel
│   ├── src/
│   │   ├── components/       # Layout, Navbar, Sidebar, ImageUpload widgets
│   │   ├── pages/
│   │   │   ├── auth/         # Admin Login Screen
│   │   │   ├── products/     # AddProduct, EditProduct, Product Catalog
│   │   │   ├── posters/      # PosterManager, PosterForm (Custom Text & CTA)
│   │   │   ├── orders/       # Order tracking and fulfillment
│   │   │   ├── users/        # User management & details
│   │   │   └── DashboardPage.jsx # Analytics & KPI metrics
│   │   └── services/         # Axios API clients
│   └── vite.config.js        # Vite build configuration
├── website/                  # Customer Web Storefront & DIY Hub (Next.js 14 / React / Tailwind)
│   ├── src/
│   │   ├── app/              # App Router (Home, Catalog, Product Details, Projects, Cart, Checkout, Auth, Orders)
│   │   ├── components/       # Header, Footer, ProductCard, BannerCarousel, ImageGallery
│   │   ├── context/          # AuthContext (session, OTP) & CartContext (persistent cart, coupons)
│   │   └── lib/              # api client, constants, shipping rates
│   └── package.json          # Next.js configuration and scripts
│
└── mobile/                   # React Native Mobile App (Tech Crate)
    ├── android/              # Native Android project configuration
    ├── ios/                  # Native iOS project configuration
    ├── src/
    │   ├── components/       # PosterCarousel, SafeImage, ProductCard, CaptchaBox
    │   ├── navigation/       # React Navigation stack (Customer, Admin, Seller)
    │   ├── screens/
    │   │   ├── auth/         # LoginScreen (OTP & Google), RegisterScreen
    │   │   ├── home/         # HomeScreen with Carousel & Dynamic Greeting
    │   │   ├── cart/         # CartScreen & CheckoutScreen
    │   │   ├── orders/       # OrderHistoryScreen & OrderDetailsScreen
    │   │   └── products/     # ProductDetailScreen with 4-image gallery & features
    │   ├── services/         # API, Auth, Payment, Poster, and Firebase clients
    │   ├── store/            # Zustand state stores (auth, cart, poster, product, wishlist)
    │   └── theme/            # Brand typography & color palette
    └── App.jsx               # Application root
```

---

## ⚡ Quick Start & Setup

### Prerequisites
- **Node.js**: v18.x or v20.x
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/TechCrate`) or MongoDB Atlas URI
- **React Native Environment**: Android Studio with SDK 34 / emulator or physical device configured

---

### 1. Backend Server Setup

```bash
cd backend
npm install
```

Create/check `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/TechCrate
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
SENTRY_DSN=your_sentry_dsn
```

Start the backend server:
```bash
npm run dev
```
Backend API will be running at **`http://localhost:5000`**.

---

### 2. Admin Web Panel Setup

```bash
cd admin
npm install
```

Create/check `admin/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_TITLE=TechCrate Admin Control Panel
```

Start the Vite development server:
```bash
npm run dev
```
Admin panel will be accessible at **`http://localhost:3000`**.

---

### 3. Mobile App Setup (React Native)

```bash
cd mobile
npm install
```

Configure `mobile/.env`:
```env
# Use 10.0.2.2 for Android Emulator, or your LAN IP (e.g., 192.168.1.X) for physical devices
API_BASE_URL=http://10.0.2.2:5000/api
```

Run on an Android device or emulator:
```bash
npm run android
```

---

### 4. Customer Web Storefront Setup (Next.js 14)

```bash
cd website
npm install
```

Configure `website/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

Start the Next.js storefront server:
```bash
npm run dev
# Or from project root:
npm run dev:website
```
Customer web application will be accessible at **`http://localhost:3001`**.

To build the production bundle:
```bash
npm run build
# Or from project root:
npm run build:website
```

---

## 📡 Core API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Admin & standard user login | No |
| `POST` | `/api/auth/send-otp` | Request mobile phone SMS OTP | No |
| `POST` | `/api/auth/verify-otp` | Verify OTP and issue JWT session | No |
| `GET` | `/api/products` | Fetch all products with filter & pagination | No |
| `GET` | `/api/products/:id` | Fetch product details (with 4 images & features) | No |
| `POST` | `/api/products` | Create new product (Title, description, features, 4 images, price) | **Admin / Seller** |
| `PUT` | `/api/products/:id` | Update product details | **Admin / Seller** |
| `DELETE` | `/api/products/:id` | Delete product | **Admin / Seller** |
| `GET` | `/api/posters` | Fetch active promotional posters for mobile carousel | No |
| `POST` | `/api/posters` | Create new poster with custom text & CTA | **Admin** |
| `PUT` | `/api/posters/:id` | Update poster metadata or toggle status | **Admin** |
| `DELETE` | `/api/posters/:id` | Remove poster | **Admin** |
| `POST` | `/api/payments/create-order` | Initialize payment order | **User** |
| `POST` | `/api/payments/verify` | Verify transaction signature | **User** |

---

## 🛡️ Security & Quality Safeguards

| Component | Safeguard Implementation |
| :--- | :--- |
| **Authentication** | Cryptographic OTP hashing, short-lived JWT tokens, isolated admin portal, Firebase Auth. |
| **Data Protection** | Sensitive credentials are never exposed in responses or stored in plaintext. Audit logs track security events. |
| **Input Validation** | Zod middleware validation schemas on API payloads (`zodValidation`). |
| **Injection Defense** | `helmet` for secure headers, `express-mongo-sanitize` to block NoSQL injection, and `xss-clean` for input sanitization. |
| **Rate Limiting** | Endpoint throttling against automated abuse and brute-force attacks via `express-rate-limit` with captcha checks. |
| **Audit & Testing** | Comprehensive security test suite (`test_security_suite.js`) & full ecommerce audit (`test_full_ecommerce_audit.js`). |

---

## 📜 License & Credits

Built with ❤️ for **Tech Crate**. All rights reserved.
