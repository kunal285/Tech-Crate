# Tech Crate — Comprehensive Full-Stack Upgrade Plan

This plan establishes the step-by-step roadmap for upgrading, hardening, and verifying the entire Tech Crate ecosystem.

---

## Phase Execution Checklist

### Phase 1 — Codebase Audit & Architectural Baseline
- [x] Audit all four applications (`/backend`, `/website`, `/admin`, `/mobile`).
- [x] Verify MongoDB schemas, Mongoose models, indexes, and queries.
- [x] Check network connectivity, CORS origins, and port bindings.
- [x] Create core documentation (`architecture.md`, `api-contracts.md`, `upgrade-plan.md`, `testing-checklist.md`, `deployment.md`).

### Phase 2 — Critical Bugs & Data Integrity Fixes
- [x] **Product Deletion & Reappearance Issue**:
  - Root Cause 1: Seed data in `backend/config/db.js` re-seeded products whenever `Product.countDocuments() === 0`. If all products were deleted or archived, restarting the backend automatically re-inserted the initial products.
  - Root Cause 2: Hard-delete (`deleteOne()`) broke historical order references.
  - Fix: Implement soft-delete / archival flag (`isArchived: Boolean`, `status: String`) on `Product.js`. Update `getProducts` to exclude archived products by default while allowing admin access with `?includeArchived=true`. Guard `db.js` seeding to run only on first-time system initialization when users collection is also empty.
- [x] **Product Images & Missing Details**:
  - Add missing fields to admin product forms (`specifications.operatingVoltage`, `specifications.pinCount`, `specifications.interface`, `specifications.dimensions`, `specifications.weight`, `sku`, `datasheetUrl`).
  - Add image fallback handling across mobile, website, and admin components.
  - Validate image uploads through Cloudinary and verify magic bytes.
  - Prevent temporary local file paths from persisting to MongoDB.
- [x] **Price & Inventory Concurrency**:
  - Ensure all checkout totals and discounts are calculated strictly server-side.
  - Atomic stock deductions on order placement.

### Phase 3 — Backend API Production Hardening
- [ ] Add `isArchived` filter to `Product` queries and indexes.
- [ ] Update `productController.js` delete handler to support both safe archival (`isArchived = true`) and permanent deletion with order-integrity verification.
- [ ] Ensure Zod validation schemas accept `isArchived`, `status`, and flexible specifications.
- [ ] Invalidate client caches upon product modification.

### Phase 4 — Admin Panel Enhancements
- [ ] Add explicit "Archive Product" vs "Permanent Delete" action with modal confirmation.
- [ ] Add full hardware specifications editor (operating voltage, pin count, interface, dimensions, datasheet link) in `AddProduct.jsx` and `EditProduct.jsx`.
- [ ] Display archived/active status badges and filtering in `ProductsPage.jsx`.

### Phase 5 — Website Upgrades (Next.js)
- [ ] Ensure `ImageGallery` handles empty, single, or broken images gracefully with electronic component placeholders.
- [ ] Verify live product rendering and server-side fetching against local backend on port 5000.
- [ ] Include detailed hardware specifications table on the product details page.

### Phase 6 — Mobile App Upgrades (React Native)
- [ ] Verify `API_BASE_URL` automatically maps to `http://10.0.2.2:5000/api` on Android emulator and `http://localhost:5000/api` on iOS.
- [ ] Update product list and detail screens to handle image galleries with fallbacks and show complete specifications.
- [ ] Verify cart, coupon application, and offline catalog cache handling.

### Phase 7 — Verification & Testing
- [ ] Run automated API regression tests.
- [ ] Run production builds for Admin (`vite build`) and Website (`next build`).
- [ ] Check Android packaging scripts.
