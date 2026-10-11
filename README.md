# Tech Crate — Complete E-Commerce Ecosystem

> **High-Performance Electronics & Maker E-Commerce Platform**  
> Built for the Indian market with strictly JavaScript (Node.js/Express, Next.js, React Native, Vite+React, MongoDB, Razorpay, and COD).

---

## 1. System Overview

Tech Crate is a unified, single-vendor electronics e-commerce platform designed for hobbyists, engineers, students, and DIY makers across India. The ecosystem comprises four interconnected applications operating against a centralized REST API:

```
                          ┌──────────────────────────┐
                          │   MongoDB 8.0 Cluster    │
                          └─────────────┬────────────┘
                                        │ Mongoose ODM
                                        ▼
                          ┌──────────────────────────┐
                          │     Tech Crate API       │
                          │   Node.js / Express.js   │
                          │   (Canonical: /api/v1)   │
                          └──────────┬───┬───┬───────┘
            ┌────────────────────────┘   │   └────────────────────────┐
            │ JSON / Cookie Auth         │ Bearer / JSON              │ JSON / Cookie Auth
            ▼                            ▼                            ▼
┌───────────────────────┐   ┌─────────────────────────┐   ┌──────────────────────┐
│  Customer Storefront  │   │   Customer Mobile App   │   │  Admin Web Panel     │
│   Next.js App Router  │   │    React Native CLI     │   │   Vite + React.js    │
│  (Port 3001, Desktop/ │   │ (Bare Android/iOS App,  │   │ (Port 5173, Products,│
│    Mobile Web)        │   │   Razorpay Native SDK)  │   │ Orders, RBAC, Stats) │
└───────────────────────┘   └─────────────────────────┘   └──────────────────────┘
```

---

## 2. Monorepo Applications & Folder Directory

Each application has its own dedicated documentation file inside its directory:

| Application | Technology Stack | Primary Directory | Dedicated Documentation |
| :--- | :--- | :--- | :--- |
| **Backend API** | Node.js 18+, Express.js 4, MongoDB, Mongoose, Jest | `backend/` | [`backend/README.md`](file:///backend/README.md) |
| **Customer Website** | Next.js 16 (App Router), React 18, Tailwind CSS | `website/` | [`website/README.md`](file:///website/README.md) |
| **Customer Mobile App** | React Native 0.87 (Bare CLI), React 19, Zustand | `mobile/` | [`mobile/README.md`](file:///mobile/README.md) |
| **Admin Panel** | React 18, Vite 5, React Router 6, Recharts | `admin/` | [`admin/README.md`](file:///admin/README.md) |

---

## 3. Technology & Architecture Stack

* **Programming Language**: Strictly **JavaScript (`.js`, `.jsx`)** across all four applications (No TypeScript).
* **Database**: MongoDB with Mongoose ODM (single source of truth for stock, transactions, and user identity).
* **Payment Gateways**:
  * **Razorpay** (Standardized gateway for UPI, RuPay, Cards, and NetBanking).
  * **Cash on Delivery (COD)** with backend validation and risk thresholds.
* **Localization & Indian Compliance**:
  * Currency: **INR (₹)**.
  * Taxation: **GST-ready** with HSN codes (e.g. HSN 8542 for ICs and electronics) and 9% CGST + 9% SGST breakdown.
  * Logistics: 6-digit Indian PIN code delivery estimator and serviceable area verification.
  * Statutory Policies: Consumer Protection (E-Commerce) Rules 2020 compliant terms, privacy, returns, cancellations, warranty, and grievance redressal officer details.

---

## 4. Quick Start — Local Development

### Prerequisites
* **Node.js**: v18.x or v20.x LTS
* **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/techcrate`) or MongoDB Atlas URI
* **Android Studio & SDK**: (Required only for running the React Native mobile app)

### Default Port Allocations
* **Backend API**: `http://localhost:5000`
* **Website Storefront**: `http://localhost:3001`
* **Admin Web Panel**: `http://localhost:5173`
* **Mobile Metro Bundler**: `http://localhost:8081` (or `8082`)

---

### Step-by-Step Launch Guide

#### 1. Start the Backend API
```bash
cd backend
npm install
# Configure your .env (see backend/README.md)
npm run dev
```

#### 2. Start the Customer Website Storefront
```bash
cd website
npm install
npm run dev
# Website opens at http://localhost:3001
```

#### 3. Start the Admin Management Panel
```bash
cd admin
npm install
npm run dev
# Admin panel opens at http://localhost:5173
```

#### 4. Launch the Customer Mobile App (Android)
```bash
cd mobile
npm install
# Start Metro bundler in one terminal:
npm run start
# In a second terminal, build and run on device/emulator:
npm run android
```

---

## 5. Architectural Principles & Security Rules

1. **Server as Single Source of Truth**:
   The backend is the sole authority for product pricing, discount calculations, coupons, GST rates, stock availability, order states, and user permissions. Client-submitted prices or stock counts are rejected.
2. **Standard API Envelope**:
   All `/api/v1/*` responses adhere to a standardized structure with correlation tracking:
   ```json
   // Success
   {
     "success": true,
     "data": { ... },
     "meta": { "timestamp": "...", "version": "v1" }
   }

   // Error
   {
     "error": {
       "code": "INSUFFICIENT_STOCK",
       "message": "Only 2 units available",
       "requestId": "req_1728589200000_abc123"
     }
   }
   ```
3. **Role-Based Access Control (RBAC)**:
   Backend enforces fine-grained roles:
   * `super_admin`: Full system control and user management.
   * `store_manager`: Products, inventory, categories, coupons.
   * `order_staff`: Order fulfillment, dispatch, tracking assignment.
   * `support`: View orders, handle returns and replacements.
   * `finance`: Invoices, revenue reports, refund reviews.
4. **Backward Compatibility**:
   Canonical endpoints live under `/api/v1/*`. Legacy unversioned `/api/*` routes are maintained as forwarders to ensure active mobile app builds continue functioning without interruption.

---

## 6. Phased Upgrade Plan Status

- [x] **Part 1: Comprehensive Architecture Audit & Gap Analysis** (Completed)
- [x] **Part 2 — Module 1: Backend Foundation, Standard Envelopes & RBAC Hardening** (Completed & Tested)
- [ ] **Part 2 — Module 2: Transactional Stock Reservation, Idempotent Checkout & Money Representation**
- [ ] **Part 2 — Module 3: Authentication Hardening & Session Security**
- [ ] **Part 3: Shared Contracts & Design Tokens**
- [ ] **Part 4: Website Integration & Cookie Auth Migration**
- [ ] **Part 5: Mobile App Modernization (Zustand, Native Razorpay, Offline Sync)**
- [ ] **Part 6: Admin Panel Modernization (RBAC Views, Analytics, Audit Trail)**
- [ ] **Part 7: Automated End-to-End Testing & Production Deployment Runbook**

For in-depth setup, architecture, and guides for individual services, refer to the folder-specific guides:
- [Backend Documentation](file:///backend/README.md)
- [Website Documentation](file:///website/README.md)
- [Mobile Documentation](file:///mobile/README.md)
- [Admin Panel Documentation](file:///admin/README.md)
