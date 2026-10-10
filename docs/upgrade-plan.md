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
- [x] Add `isArchived` filter to `Product` queries and indexes.
- [x] Update `productController.js` delete handler to support both safe archival (`isArchived = true`) and permanent deletion with order-integrity verification.
- [x] Ensure Zod validation schemas accept `isArchived`, `status`, and flexible specifications.
- [x] Invalidate client caches upon product modification.
- [x] Ensure sandbox payment redirects point to valid internal landing endpoints instead of external 404s.

### Phase 4 — Admin Panel Enhancements
- [x] Add explicit "Archive Product" vs "Permanent Delete" action with modal confirmation.
- [x] Add full hardware specifications editor (operating voltage, pin count, interface, dimensions, datasheet link) in `AddProduct.jsx` and `EditProduct.jsx`.
- [x] Display archived/active status badges and filtering in `ProductsPage.jsx`.
- [x] Point `VITE_API_BASE_URL` to persistent hosted production backend (`https://tech-crate.onrender.com/api`).

### Phase 5 — Website Upgrades (Next.js)
- [x] Ensure `ImageGallery` handles empty, single, or broken images gracefully with electronic component placeholders.
- [x] Point `NEXT_PUBLIC_API_BASE_URL` to persistent hosted production backend (`https://tech-crate.onrender.com/api`).
- [x] Include detailed hardware specifications table on the product details page.
- [x] Full production build verified (`next build` compiled 20 routes with 0 errors).

### Phase 6 — Mobile App Upgrades (React Native)
- [x] Point `API_BASE_URL` to hosted production backend (`https://tech-crate.onrender.com/api`) for standalone, terminal-free operation.
- [x] Update product list and detail screens to handle image galleries with fallbacks and show complete specifications.
- [x] Resolve all ESLint issues (0 lint errors).
- [x] Resolve missing Jest environment globals in `jest.setup.js`.
- [x] Bundle Android assets successfully (`index.android.bundle` generated with 21 assets, 0 errors).

### Phase 7 — Verification & Testing
- [x] Run automated API regression tests: 30/30 tests passed (100%).
- [x] Run production builds for Admin (`vite build` - 0 errors) and Website (`next build` - 0 errors).
- [x] Verified mobile bundling (`react-native bundle --platform android` - 0 errors).
- [x] Verified zero deleted products reappearing across database restarts and customer catalog endpoints.
- [x] Verified hosted backend health (`https://tech-crate.onrender.com/health` and `/ready`).
