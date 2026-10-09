# Tech Crate — Deployment & Environment Configuration Guide

This document describes the deployment architecture, environment configurations, and production build instructions for all applications in the Tech Crate workspace.

---

## 1. Hosting Architecture Overview

| Application | Hosting Provider / Platform | Production URL | Dev URL |
| :--- | :--- | :--- | :--- |
| **Backend API** | Vercel / Render / Node VPS | `https://tech-crate.onrender.com` | `http://localhost:5000` |
| **Customer Website** | Vercel (Next.js) | `https://techcrate-store.vercel.app` | `http://localhost:3000` |
| **Admin Panel** | Vercel (Vite SPA) | `https://tech-crate-tau.vercel.app` | `http://localhost:5173` |
| **Mobile App** | Android APK / Internal Release | Standalone APK (`assembleRelease`) | Metro Bundler (:8081 / :8082) |

---

## 2. Environment Variables Specification

### A. Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:5173

# Database Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.dxhqcj9.mongodb.net

# JWT Secrets
JWT_SECRET=<64-char-hex-secret>

# Media & Storage
CLOUDINARY_CLOUD_NAME=dmy7cmuq9
CLOUDINARY_API_KEY=693495287588353
CLOUDINARY_API_SECRET=<secret>

# Firebase Admin
FIREBASE_PROJECT_ID=techcrate-2e07a
```

### B. Website (`website/.env.local`)
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_ADMIN_URL=http://localhost:5173
NEXT_PUBLIC_APP_NAME="Tech Crate"
NEXT_PUBLIC_APP_TAGLINE="Everything You Need to Build."
```

### C. Admin Panel (`admin/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WEBSITE_URL=http://localhost:3000
```

### D. Mobile App (`mobile/.env`)
```env
# Android Emulator local backend loopback
API_BASE_URL=http://10.0.2.2:5000/api
# Production fallback: https://tech-crate.onrender.com/api
FIREBASE_PROJECT_ID=techcrate-2e07a
```

---

## 3. Production Build Instructions

### Admin Panel
```powershell
cd admin
npm run build
# Output: admin/dist/ ready for static hosting
```

### Website (Next.js)
```powershell
cd website
npm run build
# Output: website/.next/ ready for Node/Vercel SSR
```

### Mobile App (Android APK Build)
```powershell
cd mobile
# Bundle JavaScript assets
npm run bundle:android
# Assemble release APK
cd android
./gradlew assembleRelease
# Output: mobile/android/app/build/outputs/apk/release/app-release.apk
```
