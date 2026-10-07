# Tech Crate Product Roadmap

This document outlines the development status and planned milestones for **Tech Crate (TechCrate)**.

---
Techcrate@2029

## 🎯 Status Legend
- 🟢 **Completed**: Shipped and operational in codebase.
- 🟡 **In Progress**: Currently under active development or refinement.
- 🔵 **Planned**: Scheduled for upcoming releases.
- 💡 **Future Ideas**: Proposed concepts under evaluation.

---

## 📅 Roadmap Milestones

### Phase 1: Core E-Commerce & Platform Foundations 🟢
- 🟢 Full-stack Node.js / Express REST API.
- 🟢 React Native mobile app (Android & iOS).
- 🟢 React + Vite Admin Management Dashboard.
- 🟢 4-Slot product image gallery (Cover, Angle, Schematic, Packaging).
- 🟢 Admin-controlled promotional poster carousel with deep links.
- 🟢 Mobile-first passwordless SMS OTP authentication with rate limiting & Captcha.
- 🟢 Firebase Google Sign-In & JWT session lifecycle.

### Phase 2: Payments, Security & Observability 🟢
- 🟢 Razorpay payment gateway integration (`/api/payments`).
- 🟢 Zod request validation middleware.
- 🟢 Security audit logging (`AuditLog`) & security test suite.
- 🟢 Sentry error tracking & performance monitoring.
- 🟢 Supabase SQL schema export (`supabase_schema.sql`).
- 🟢 OpenAPI 3.0 specification (`openapi.json`).

### Phase 3: AI Guidance & Student Project Platform 🟡
- 🟢 Rule-assisted AI assistant controller (`/api/ai/chat`) for hardware recommendations.
- 🟡 Integration of Gemini API SDK for full dynamic hardware diagnostic chat.
- 🟡 Automated PCB circuit pinout auto-verifier for student project kits.

### Phase 4: Vendor Marketplace & Multi-Warehouse Fulfillment 🔵
- 🔵 Multi-vendor registration and seller approval portal expansion.
- 🔵 Real-time push notifications for order fulfillment stages via Firebase Cloud Messaging (FCM).
- 🔵 Advanced inventory tracking with multi-warehouse allocation.

### Phase 5: Community & AR Hardware Previews 💡
- 💡 AR 3D component preview on mobile using WebGL/Three.js.
- 💡 Student maker community forum & project showcase gallery.
