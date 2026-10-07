# Configuration & Environment Variables Reference

This document details all configuration options, environment variable schema, API key properties, and security configurations across **Tech Crate**.

> [!WARNING]
> Never commit actual `.env` files or API secrets into source control. Always use `.env.example` templates.

---

## 🔑 Backend Environment Variables (`backend/.env`)

| Variable Name | Required | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | No | `5000` | Port for Express HTTP server to listen on. |
| `NODE_ENV` | Yes | `development` | Environment mode (`development`, `production`, `test`). |
| `MONGO_URI` | Yes | `mongodb://127.0.0.1:27017/TechCrate` | MongoDB connection URI string. |
| `JWT_SECRET` | Yes | *Required* | Secret key for signing JSON Web Tokens. |
| `JWT_EXPIRE` | No | `30d` | JWT access token expiration duration. |
| `REFRESH_TOKEN_SECRET` | No | *Secret* | Secret key for signing long-lived refresh tokens. |
| `CLOUDINARY_CLOUD_NAME` | Yes | *Required* | Cloudinary cloud account name for image uploads. |
| `CLOUDINARY_API_KEY` | Yes | *Required* | Cloudinary API Key. |
| `CLOUDINARY_API_SECRET` | Yes | *Required* | Cloudinary API Secret. |
| `SENTRY_DSN` | No | *Optional* | Sentry project DSN for error telemetry. |
| `RAZORPAY_KEY_ID` | No | *Optional* | Razorpay API Key ID for live transactions. |
| `RAZORPAY_KEY_SECRET` | No | *Optional* | Razorpay API Key Secret. |
| `FIREBASE_SERVICE_ACCOUNT` | No | *Optional* | Path to Firebase Admin SDK JSON credentials. |

---

## 💻 Admin Panel Environment Variables (`admin/.env`)

| Variable Name | Required | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Yes | `http://localhost:5000/api` | Base URL of backend REST API server. |
| `VITE_APP_TITLE` | No | `TechCrate Admin` | Title displayed in browser header. |

---

## 📱 Mobile App Environment Variables (`mobile/.env`)

| Variable Name | Required | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `API_BASE_URL` | Yes | `http://10.0.2.2:5000/api` | API Base URL (`10.0.2.2` for Android Emulator, LAN IP for physical device). |
| `FIREBASE_WEB_CLIENT_ID` | No | *Optional* | OAuth 2.0 Web Client ID for Google Sign-In. |

---

## 🛡️ Security Configuration Validation (`utils/validateEnv.js`)

At backend server startup, `validateEnv.js` executes automatic pre-flight checks:
- Verifies `JWT_SECRET` exists and is non-empty.
- Verifies `MONGO_URI` format.
- Validates Cloudinary config parameters before enabling upload routes.
