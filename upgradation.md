# MASTER PROMPT: UPGRADE MY EXISTING FULL-STACK E-COMMERCE PROJECT

Act as a Senior Full-Stack Software Architect, React Native Engineer, Next.js Developer, Node.js Backend Engineer, Database Specialist, UI/UX Designer, QA Engineer, and DevOps Engineer.

Your task is to thoroughly inspect, upgrade, optimize, debug, and production-harden my **existing e-commerce project** while preserving its current functionality, business logic, data, and established technology stack.

Do not create a new project from scratch. Work directly with the existing codebase.

## 1. EXISTING TECHNOLOGY STACK

My project contains four major applications:

### A. Customer Mobile App
- React Native CLI (bare React Native project).
- JavaScript and JSX only.
- Android-focused development, with iOS compatibility where currently supported.
- Connect to the existing Node.js/Express backend.
- Firebase integration for the features already using Firebase.

### B. Customer Website
- Next.js.
- React.
- JavaScript and JSX only.
- Responsive desktop, tablet, and mobile layouts.
- SEO-friendly product, category, and content pages.
- Connect to the existing backend API.

### C. Backend API
- Node.js.
- Express.js.
- JavaScript only.
- MongoDB as the primary application database, using the existing database access layer.
- Firebase services where required by the current implementation, such as Firebase Authentication, Firebase Cloud Messaging, or other already-configured Firebase features.
- REST APIs shared by the mobile app, website, and admin panel.

### D. Admin Panel
- React.js.
- JavaScript and JSX only.
- Existing admin authentication and role-based permissions.
- Product, category, inventory, order, customer, payment, and content management.
- Connect to the same backend and source of truth used by the mobile app and website.

Do not replace MongoDB with PostgreSQL or replace the existing Express backend with Next.js API routes. Do not migrate to TypeScript. Retain the current architecture unless an actual technical problem requires a carefully explained change.

## 2. FIRST: AUDIT THE EXISTING PROJECT

Before modifying any files:

1. Inspect the complete repository and identify all applications, packages, routes, components, services, configurations, and environment files.
2. Determine the exact folder structure and how the mobile app, website, backend, admin panel, MongoDB, and Firebase are connected.
3. Inspect package.json files, installed dependencies, scripts, API endpoints, database models, authentication middleware, and deployment configuration.
4. Identify existing features that work, partially work, or are broken.
5. Find duplicate components, duplicated business logic, inconsistent API contracts, unused dependencies, and insecure implementations.
6. Check whether mobile, website, and admin panel are using the same product, image, stock, price, and order data.
7. Prepare a prioritized list of bugs, security issues, performance bottlenecks, and upgrade opportunities.

Create or update project documentation:
- docs/architecture.md
- docs/api-contracts.md
- docs/upgrade-plan.md
- docs/testing-checklist.md
- docs/deployment.md

Do not claim to have inspected, tested, or fixed anything you have not actually inspected, tested, or fixed.

## 3. CRITICAL BUG FIXES

Give special priority to the following issues:

### Product deletion and data consistency
- When an administrator deletes or archives a product, it must not unexpectedly reappear.
- Investigate MongoDB persistence, frontend state, API responses, caching, stale queries, database filters, and product synchronization.
- Ensure the product is removed from active catalogue queries after a successful deletion or archival.
- Invalidate or refresh relevant caches and client-side product lists.
- Check MongoDB document identifiers, soft-delete filters, pagination, and duplicate records.
- Preserve historical order records and references when products have previously been purchased.
- Use safe archival or soft deletion where permanent deletion could damage order history.

### Product images and missing product details
- Ensure product images, descriptions, specifications, variants, prices, and stock details are saved and retrieved correctly.
- Fix image upload, storage, URL generation, serialization, and display problems.
- Verify the actual API response and MongoDB document before changing the UI.
- Support existing image-storage providers and Firebase Storage or other storage services already used by the project.
- Do not store local temporary file paths as production image URLs.
- Validate image URLs and handle loading, broken images, empty galleries, and upload errors.
- Ensure newly added products immediately appear correctly across the website, mobile app, and admin panel.
- Check field-name mismatches between frontend forms, Express controllers, database models, and API responses.

### Additional bug prevention
- Prevent duplicate products and duplicate submissions.
- Fix cart quantities, incorrect prices, stale inventory, and inconsistent order states.
- Fix authentication persistence, token expiration, and logout behavior.
- Resolve API connection failures, CORS issues, malformed responses, and missing error handling.
- Check race conditions, pagination, filtering, sorting, and search.
- Prevent failed operations from appearing successful in the UI.

For every fix, identify the root cause, implement the correction, and provide reproducible verification steps.

## 4. CUSTOMER MOBILE APP UPGRADE

Upgrade the existing React Native CLI app with:

- A polished, premium, modern electronics-shopping experience.
- Consistent typography, spacing, colors, icons, and reusable components.
- Responsive layouts for supported device sizes.
- Smooth navigation and appropriate loading, empty, success, and error states.
- Product catalogue, categories, search, filters, sorting, and product specifications.
- Product image galleries with thumbnails and swipe navigation.
- Cart, coupon application, checkout, address management, and order history.
- Secure login, registration, logout, and account management.
- Wishlist and recently viewed products where appropriate.
- Order tracking, cancellation, return, and refund status where supported.
- Push notifications through the existing Firebase Cloud Messaging integration, if configured.
- Optimized images, lists, API calls, and rendering.
- Offline-friendly handling for appropriate cached catalogue data without treating stale prices or stock as authoritative.
- Accessibility, keyboard handling, Android back-button behavior, and reliable navigation.

Preserve the current navigation library, state-management solution, and component conventions when they are working well. Do not introduce unnecessary dependencies.

Do not require Google Play publication. Keep the application buildable and distributable through appropriate APK or other supported Android distribution methods.

## 5. WEBSITE UPGRADE — NEXT.JS

Upgrade the existing website with:

- A premium, professional, conversion-focused design.
- A responsive homepage, navigation, category pages, search, product details, cart, checkout, account pages, and order history.
- Consistent product data and pricing from the backend.
- Correct product images and detailed product specifications.
- SEO metadata, canonical URLs, sitemap, robots configuration, and structured product data where appropriate.
- Appropriate server rendering and caching strategies without displaying stale prices or stock.
- Optimized images and performance.
- Accessible forms, keyboard navigation, and clear validation messages.
- Proper loading, error, not-found, and empty states.
- Secure authentication and protected account routes.
- Safe API integration without exposing private credentials or server secrets.

Use the existing Next.js routing architecture. Do not migrate between the App Router and Pages Router unless the audit demonstrates a compelling need.

## 6. BACKEND UPGRADE — NODE.JS, EXPRESS, MONGODB AND FIREBASE

Improve the existing backend while preserving its API compatibility wherever possible.

### Architecture
- Organize the existing code into routes, controllers, services, models, middleware, validators, and integrations where appropriate.
- Keep business logic in service layers.
- Use consistent request and response formats.
- Add centralized error handling and structured logging.
- Introduce API versioning if compatible with the existing routes.
- Validate request bodies, query parameters, and route parameters.

### MongoDB
- Inspect existing schemas, references, indexes, validation rules, and query patterns.
- Add appropriate indexes and uniqueness constraints where justified.
- Use MongoDB transactions when supported by the configured deployment and required by the operation.
- Make updates and order creation safe against duplicate requests and concurrency issues.
- Maintain consistent product, image, inventory, and order relationships.
- Use pagination for catalogue and administrative queries.
- Preserve historical order snapshots and avoid accidental data loss.
- Create safe migrations or backfills for any schema changes.

### Firebase
- Audit the current Firebase configuration and actual feature usage.
- Reuse the existing Firebase project and credentials.
- Verify Firebase Authentication tokens on the backend if Firebase Authentication is used.
- Keep Firebase Admin SDK credentials exclusively on trusted server infrastructure.
- Use Firebase Cloud Messaging only where configured and needed.
- Configure Firebase Storage access rules if Storage is used.
- Avoid creating duplicate authentication systems or duplicate sources of truth.

### Security
- Enforce authentication and authorization on protected endpoints.
- Add role-based access control for administrative operations.
- Validate ownership of orders, addresses, and customer-specific resources.
- Add suitable rate limiting, secure headers, input validation, and restrictive CORS rules.
- Protect against injection, broken access control, unauthorized uploads, and mass assignment.
- Store secrets in environment variables or the hosting provider's secret manager.
- Never expose database credentials, Firebase private keys, payment secrets, or access tokens in frontend bundles.
- Redact sensitive information from logs.

## 7. ADMIN PANEL UPGRADE — REACT.JS

Upgrade the existing admin panel into a professional, reliable management interface.

Include or improve:

- Dashboard with accurate sales, order, inventory, and low-stock summaries.
- Product creation, editing, archival/deletion, variants, SKUs, and image uploads.
- Category and subcategory management.
- Inventory adjustments and stock movement history.
- Order management with payment and fulfillment statuses.
- Customer management with appropriate access restrictions.
- Coupon and promotional campaign management.
- Product search, filters, pagination, and sorting.
- Reports and CSV exports where appropriate.
- Admin profile and account management.
- Role-based access for permitted administrative actions.
- Audit logs for sensitive changes.
- Clear confirmation dialogs for destructive operations.
- Toast notifications, field-level validation, loading states, and retry actions.
- Correct handling of failed API requests.

After saving a product, updating stock, or processing an order, the panel must reflect the actual persisted backend state rather than only changing local frontend state.

## 8. SINGLE SOURCE OF TRUTH AND DATA SYNCHRONIZATION

The Express backend and MongoDB must remain authoritative for product records, prices, discounts, inventory, orders, and payment status.

Ensure the mobile app, website, and admin panel use consistent API contracts.

For each product operation, verify the complete flow:

Admin form → API request → Express validation → service/controller → MongoDB persistence → API response → client state/cache update → refreshed product display.

Use consistent identifiers and field names across applications.

Avoid duplicate backend implementations, hardcoded product data in production, fake success responses, and separate conflicting inventory records.

## 9. PAYMENTS, CHECKOUT AND ORDER SAFETY

Audit the existing payment integration before modifying it.

- Preserve the configured payment provider unless a change is explicitly justified.
- Calculate the final payable amount on the server.
- Verify payment signatures and payment status server-side.
- Handle payment webhooks securely and idempotently.
- Prevent duplicate orders and duplicate payment processing.
- Support appropriate pending, paid, failed, cancelled, refunded, and COD states where applicable.
- Maintain consistent inventory reservation and release rules.
- Do not trust client-submitted totals or payment-success flags.
- Test success, failure, timeout, duplicate webhook, cancellation, and refund flows.
- Never store raw card numbers or CVV.

Do not enable live payments until sandbox tests and required verification are complete.

## 10. PERFORMANCE AND CODE QUALITY

- Remove demonstrably unused code and dependencies only after checking their usage.
- Reduce unnecessary re-renders and duplicate API calls.
- Optimize images and large product lists.
- Add sensible caching and invalidation rules.
- Avoid N+1 database query patterns.
- Improve API response times without weakening data consistency.
- Maintain reusable components and clear naming.
- Use JavaScript and JSX files only; do not introduce TypeScript.
- Follow the project's existing linting and formatting rules where practical.
- Keep changes modular, readable, maintainable, and easy to review.

## 11. TESTING AND VERIFICATION

Add or improve tests using tools compatible with the existing repository.

Test:
- Product creation, update, archival/deletion, and reload persistence.
- Product image upload and rendering.
- Missing and malformed product fields.
- MongoDB validation and error handling.
- Mobile, website, and admin API integration.
- Login, logout, authentication expiry, and authorization.
- Product search, filtering, sorting, and pagination.
- Cart totals, discounts, and inventory validation.
- Order creation, payment verification, and webhook idempotency.
- Admin permissions and customer data isolation.
- Regression cases for every repaired bug.

Run the applicable test suite, lint checks, and production builds.

If a test cannot run because of missing credentials, unavailable services, or environmental restrictions, state the exact limitation. Never fabricate passing test results.

## 12. DEPLOYMENT AND CONFIGURATION

Preserve the existing deployment arrangement unless the audit identifies a real issue.

- The website and backend are already deployed on Vercel.
- Maintain the existing Vercel deployments and environment configuration where appropriate.
- Keep the mobile app independent of website hosting and prepare it for the existing or intended AWS distribution/deployment workflow.
- Do not move services or change production domains without authorization.
- Verify HTTPS, API base URLs, CORS, environment variables, and webhook URLs.
- Maintain separate development, staging, and production configurations.
- Document Android APK generation and private distribution without requiring Google Play publication.
- Include rollback instructions for risky production changes.
- Never commit real credentials or overwrite production data during testing.

## 13. REQUIRED WORKING METHOD

Follow these phases in order:

Phase 1 — Audit the existing codebase and document the architecture.

Phase 2 — Identify and prioritize critical bugs, data-integrity issues, security risks, and user-experience problems.

Phase 3 — Fix data persistence, product deletion, image uploads, and missing product details first.

Phase 4 — Upgrade backend reliability, authentication, API consistency, and MongoDB integrity.

Phase 5 — Upgrade the admin panel, website, and mobile app while preserving existing functionality.

Phase 6 — Improve performance, accessibility, error handling, and visual consistency.

Phase 7 — Run tests, builds, regression checks, and deployment verification.

Phase 8 — Document the final changes, configuration requirements, known limitations, and remaining work.

Work in small, reviewable steps. Before changing a shared API or database schema, check all affected applications.

Do not delete files, replace major dependencies, rewrite the application, reset databases, or modify production configuration without establishing that the change is necessary and safe.

Do not stop after producing a plan. Once the audit is complete, begin implementing the highest-priority fixes in the existing repository, subject to the available tools and permissions.

## 14. FINAL REPORT

At the end of the work, provide:

1. Summary of the original architecture.
2. Bugs discovered and their verified root causes.
3. Files changed and why.
4. Features upgraded in each application.
5. Database or API changes and migration instructions.
6. Security and performance improvements.
7. Tests executed and their actual results.
8. Build and deployment status.
9. Environment variables or manual configuration still required.
10. Known limitations and recommended next steps.

SUCCESS CRITERIA:

The existing project remains recognizable and functional, all four applications continue to integrate correctly, product information and images persist reliably, deleted or archived products do not reappear unexpectedly, authentication and payments remain secure, and all changes are tested and documented.

Begin by inspecting the existing repository. Make evidence-based changes, preserve working features, and prioritize reliability over unnecessary rewrites.