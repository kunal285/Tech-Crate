# Testing & Verification Guide

This document describes the automated test suites, testing frameworks, and verification commands in **Tech Crate**.

---

## 🧪 Test Architecture

```text
backend/scripts/
├── test_security_suite.js        # Authentication, rate limiting, and RBAC security checks
├── test_full_ecommerce_audit.js   # End-to-end product, cart, order, and poster flow verification
└── test_otp_suite.js              # OTP hashing, rate limit cooldowns, and TTL expiry test suite

mobile/
├── __tests__/App.test.tsx         # Jest React Native component testing
└── jest.setup.js                  # Native module mocks (Firebase, AsyncStore, Reanimated)
```

---

## 🚀 Execution Commands

### 1. Backend Security Test Suite
```bash
cd backend
node scripts/test_security_suite.js
```
**Validates**:
- Admin portal privilege isolation.
- Rate limiter lockout on rapid OTP requests.
- Invalid JWT token rejection.

---

### 2. Full E-Commerce Audit Suite
```bash
cd backend
node scripts/test_full_ecommerce_audit.js
```
**Validates**:
- Product CRUD lifecycle.
- Active poster banner listing.
- Cart item accumulation and order status transitions.

---

### 3. Mobile App Jest Suite
```bash
cd mobile
npm test
```
Runs component rendering tests and Zustand state store unit tests.
