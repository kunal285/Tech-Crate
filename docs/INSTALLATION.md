# Installation & Environment Setup Guide

This document covers system prerequisites, dependency installation, database configuration, and starting the local development environment for **Tech Crate (TechCrate)**.

---

## 💻 System Prerequisites

| Dependency | Minimum Version | Recommended Version |
| :--- | :--- | :--- |
| **Node.js** | v18.16.0 | v20.x LTS |
| **npm** | v9.x | v10.x |
| **MongoDB** | v6.0 | v7.0 Local or MongoDB Atlas |
| **Android Studio** | Electric Eel+ | Android Studio Jellyfish (SDK 34) |
| **Java Development Kit (JDK)** | OpenJDK 17 | OpenJDK 17 |
| **Git** | 2.30+ | Latest |

---

## 🛠️ Step-by-Step Installation

### 1. Clone Repository

```bash
git clone https://github.com/kunal285/Project-kart.git
cd Project-kart
```

---

### 2. Backend Server Setup

```bash
cd backend
npm install
```

Configure `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/TechCrate
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
SENTRY_DSN=your_sentry_dsn_here
```

Seed initial database records:
```bash
npm run seed
```

Start backend development server:
```bash
npm run dev
```
Verify backend API health at `http://localhost:5000`.

---

### 3. Admin Web Panel Setup

```bash
cd ../admin
npm install
```

Configure `admin/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_TITLE=TechCrate Admin Management
```

Start Vite dev server:
```bash
npm run dev
```
Access the Admin Dashboard at `http://localhost:3000`.

---

### 4. React Native Mobile App Setup

```bash
cd ../mobile
npm install
```

Configure `mobile/.env`:
```env
# For Android Emulator use 10.0.2.2. For physical Android devices use LAN IP (e.g. 192.168.1.50)
API_BASE_URL=http://10.0.2.2:5000/api
```

#### Run on Android:
Ensure Android Emulator is running or USB Debugging is enabled on connected device.

```bash
npm run android
```

If Metro cache issues occur:
```bash
npm start -- --reset-cache
```

---

## 🔧 Verification Checklist

- [ ] Backend returns `200 OK` on `GET http://localhost:5000/api/products`.
- [ ] Admin panel loads login form at `http://localhost:3000`.
- [ ] Admin credentials (`admin` / `password123`) authenticate successfully.
- [ ] Mobile app boots to Home Screen with dynamic greeting and active banner carousel.
