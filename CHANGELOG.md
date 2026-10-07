# Changelog

All notable changes to the **Tech Crate (TechCrate)** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Comprehensive Markdown documentation system in `docs/`.
- Sentry error monitoring and performance telemetry integration.
- Supabase relational SQL schema (`backend/database/supabase_schema.sql`) for hybrid deployments.
- OpenAPI 3.0 specification (`backend/docs/openapi.json`).
- Zod request body & parameter validation middleware.
- Security audit logging (`AuditLog`) & security test suite (`test_security_suite.js`).
- Dynamic 4-image product slots with technical schematic & pinout views.
- Admin-managed banner carousel (`/api/posters`) with custom text, deep links, and CTA buttons.
- Captcha security box for OTP authentication (`CaptchaBox.js`).

### Changed
- Refactored Firebase Auth SDK integration for native Android Google Sign-In.
- Enhanced Metro bundler dependency resolution and reset cache logic.

### Fixed
- Fixed Metro 500 `resolveDependency` error by optimizing Firebase modular imports.
- Resolved admin role escalation vulnerability on customer OTP login endpoints.

---

## [1.0.0] - 2026-10-06

### Added
- Initial release of Tech Crate Node.js backend REST API.
- React 18 + Vite Admin Control Panel.
- React Native Android & iOS mobile app for product browsing, cart, and checkout.
- MongoDB Mongoose database schemas for Users, Products, Categories, Posters, Orders, and Coupons.
