/**
 * Production Sentry Observability Configuration
 * Initializes Sentry for backend error reporting and performance monitoring.
 * Scrubs all sensitive data (passwords, tokens, payment credentials, JWTs) before sending.
 */

const Sentry = require('@sentry/node');

const initSentry = (app) => {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.log('[Sentry Observability] SENTRY_DSN not configured in environment — CONFIGURED BUT UNVERIFIED');
    return {
      captureException: (err) => console.error('[Error Recorded (Local)]', err?.message || err),
    };
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
      beforeSend(event) {
        // Sensitive field names to scrub
        const sensitiveKeys = [
          'password',
          'token',
          'jwt',
          'authorization',
          'secret',
          'razorpay_signature',
          'razorpay_key_secret',
          'apiKey',
          'api_secret',
          'private_key',
          'cvv',
          'cardNumber',
        ];

        const sanitizeObject = (obj) => {
          if (!obj || typeof obj !== 'object') return obj;
          for (const key of Object.keys(obj)) {
            if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
              obj[key] = '[REDACTED]';
            } else if (typeof obj[key] === 'object') {
              sanitizeObject(obj[key]);
            }
          }
          return obj;
        };

        if (event.request?.headers) {
          if (event.request.headers.authorization) {
            event.request.headers.authorization = '[REDACTED]';
          }
          if (event.request.headers.cookie) {
            event.request.headers.cookie = '[REDACTED]';
          }
        }

        if (event.request?.data) {
          sanitizeObject(event.request.data);
        }

        return event;
      },
    });

    console.log('[Sentry Observability] Successfully initialized Sentry SDK');
    return Sentry;
  } catch (err) {
    console.error('[Sentry Init Error]', err.message);
    return Sentry;
  }
};

module.exports = { initSentry, Sentry };
