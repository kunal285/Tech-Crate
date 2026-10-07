# Local Development Guide

This guide provides step-by-step instructions for developers adding new features, APIs, database models, or mobile components to **Tech Crate (TechCrate)**.

---

## 🏗️ Project Architecture Layout

- `backend/`: Node.js Express server.
  - `controllers/`: Request handler logic.
  - `models/`: Mongoose schemas.
  - `routes/`: Express route definitions.
  - `middleware/`: Auth, rate limiters, input validation.
  - `validators/`: Zod payload schemas.
- `admin/`: React + Vite admin dashboard.
  - `src/pages/`: Admin screen views.
  - `src/components/`: Shared UI widgets.
  - `src/store/`: Zustand state management.
- `mobile/`: React Native mobile application.
  - `src/screens/`: Navigation screens.
  - `src/components/`: Reusable components (`CaptchaBox`, `PosterCarousel`).
  - `src/store/`: Zustand mobile stores.

---

## ➕ Adding a New API Endpoint

1. **Define Payload Schema** in `backend/validators/schemas.js` using Zod.
2. **Create Controller Logic** in `backend/controllers/<target>Controller.js`.
3. **Register Route** in `backend/routes/<target>Routes.js` attaching middleware (`protect`, `zodValidation`).
4. **Mount Route** in `backend/server.js`.
5. **Add Client Method** in `mobile/src/services/api.js` and `admin/src/services/adminApi.js`.
6. **Add Automated Test** in `backend/scripts/test_full_ecommerce_audit.js`.
