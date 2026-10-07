# Security Policy

## Security Overview

**Tech Crate (TechCrate)** takes security seriously. We implement robust, layered security controls across our backend REST API, admin panel, and React Native mobile application.

---

## 🛡️ Key Security Controls

1. **Authentication & Privilege Isolation**:
   - Customer OTPs are hashed using cryptographic SHA-256 before database storage.
   - 5-minute auto-expiry on OTPs enforced via MongoDB TTL indexes.
   - Admin authentication (`POST /api/auth/login`) is strictly isolated; customer OTP endpoints cannot grant admin roles.
2. **Rate Limiting & Abuse Prevention**:
   - Express rate limiters (`express-rate-limit`) throttle sensitive auth, OTP, and checkout endpoints.
   - Client-side `CaptchaBox` integration prevents automated brute-force attacks.
3. **Input Sanitization & Injection Defense**:
   - `helmet` sets secure HTTP response headers.
   - `express-mongo-sanitize` strips `$` and `.` operators to eliminate NoSQL injection risks.
   - `xss-clean` sanitizes user input HTML.
   - `zod` schemas validate incoming request bodies and parameters.
4. **Audit Logging & Telemetry**:
   - Critical operations (role modifications, seller approvals, security revocations) write immutable records to `AuditLog`.
   - Sentry error monitoring catches unhandled exceptions without leaking stack traces to clients.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability within Tech Crate:

1. **Do NOT** disclose it publicly via GitHub Issues or social media.
2. Email full technical details and reproduction steps to `admin@techcrate.com`.
3. Our maintainers will acknowledge receipt within 24 hours and provide regular updates on remediation progress.
