# 🛒 ProjectKart - E-Commerce & Student Project Portal

Welcome to **ProjectKart**, a full-stack e-commerce and student project ecosystem featuring a **Node.js/Express REST API**, a modern **React + Vite Admin Dashboard**, and a **React Native Mobile App** specifically built for **Customers and Students**.

---

## 🔐 Passwordless SMS OTP Authentication

ProjectKart features a **Production-Grade Passwordless SMS OTP System** tailored exclusively for **Customers** and **Students**.

### 🌟 Key Features
- **Mobile-First Passwordless Login:** Customers and Students log in using `+91 Mobile Number` + `6-Digit SMS OTP` (No passwords required).
- **Strict Admin Isolation:** Admin authentication remains completely separate at `/admin/login`. Admin accounts cannot authenticate via the Customer/Student OTP flow, and privilege escalation is blocked server-side.
- **Cryptographic Security:** 6-digit PINs generated via `crypto.randomInt` and stored strictly as SHA-256 hashes in MongoDB.
- **5-Minute Expiration & Single-Use:** OTP challenges expire after 5 minutes and are automatically pruned via MongoDB TTL indexes. Challenges are marked `used` immediately upon verification or reaching 5 failed attempts.
- **Rate Limiting & Cooldowns:** Enforces a 30-second resend cooldown timer and a 5-attempt limit to protect against brute-force attacks and SMS flooding.
- **Account Enumeration Protection:** Generic non-revealing messages (*"If this mobile number is valid, an OTP has been sent."*).

---

## 🏗️ Repository Architecture

```text
ProjectKart/
├── backend/                  # Node.js + Express REST API Server
│   ├── controllers/          # Request handlers (auth, otp, products, orders, admin)
│   ├── middleware/           # Security middleware (WAF, rate limiting, JWT auth)
│   ├── models/               # MongoDB Mongoose schemas (User, OtpChallenge, Product, Order)
│   ├── routes/               # API route definitions (/api/auth, /api/products, etc.)
│   └── services/             # Transactional SMS service & business logic
├── admin/                    # React + Vite Web Management Panel (Admins)
│   ├── src/components/       # UI Components & Dashboard Widgets
│   ├── src/pages/            # Admin Pages (Product Management, Orders, Users, Analytics)
│   └── vite.config.js        # Vite config with vendor chunk optimization
└── mobile/                   # React Native Application (Customers & Students)
    ├── src/screens/          # App screens (LoginScreen, RegisterScreen, Home, Cart, Orders)
    ├── src/services/         # API Service client & authService
    └── src/store/            # State management (Zustand authStore)
```

---

## ⚡ Quick Start & Setup

### Prerequisites
- **Node.js**: v18+ or v20+
- **MongoDB**: Local instance or MongoDB Atlas Connection URI
- **React Native SDK**: Android Studio / Xcode configured for mobile app execution

---

### 1. Backend API Setup

```bash
cd backend
npm install
```

Configure `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/projectkart
JWT_SECRET=your_super_secret_jwt_key
SMS_PROVIDER_API_KEY=your_sms_api_key
SMS_PROVIDER_SECRET=your_sms_secret
SMS_SENDER_ID=PRJKRT
```

Start backend development server:
```bash
npm run dev
```

---

### 2. Admin Web Panel Setup

```bash
cd admin
npm install
npm run dev
```
The Admin Panel will open at `http://localhost:3000`.

---

### 3. Mobile App Setup (Customers & Students)

```bash
cd mobile
npm install
```

Run on Android device or emulator:
```bash
npm run android
```

---

## 🛡️ Security Audit & Safeguards

| Component | Security Safeguard |
| :--- | :--- |
| **Authentication** | Dual authentication system: Passwordless OTP for Customers/Students; Dedicated credential portal for Admins. |
| **Data Protection** | Sensitive tokens & OTP hashes are never stored in plaintext. |
| **Header Security** | Protection against XSS, clickjacking, and MIME-sniffing via `helmet`, `xss-clean`, and `express-mongo-sanitize`. |
| **Session Control** | Short-lived JWT access tokens paired with HttpOnly, SameSite refresh cookies. |
| **WAF & Rate Limits** | Request rate-limiting via `express-rate-limit` on all public endpoints. |

---

## 📜 License & Credits

Built with ❤️ for ProjectKart. All rights reserved.
