# Authentication & Security Architecture Feature Specification

This document details the security safeguards, rate limiters, captcha box component, and audit logging infrastructure.

---

## 🛡️ Key Components

### 1. Captcha Verification (`CaptchaBox.js`)
- Client-side interactive challenge component required before requesting SMS OTPs.
- Guards against automated bot scripts calling `/api/auth/send-otp`.

### 2. Rate Limiting Middleware (`middleware/rateLimiter.js`)
- **`otpLimiter`**: Restricts OTP generation requests to 3 per 15-minute window per IP / phone number.
- **`authLimiter`**: Throttles login endpoints to protect against brute-force password guessing.
- **`checkoutLimiter`**: Restricts rapid payment initialization.

### 3. Zod Payload Validation (`middleware/zodValidation.js`)
- Payload schemas (`validators/schemas.js`) enforce strict string formatting, mobile number Regex (`/^\+91[0-9]{10}$/`), and type checks prior to database execution.

### 4. Audit Logging Service (`services/auditService.js`)
- Records administrative events, security revocations, and user role updates to `AuditLog`.
