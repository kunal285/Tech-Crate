const IdempotencyKey = require('../models/IdempotencyKey');

/**
 * Idempotency Middleware for transactional endpoints (checkout, orders, payment verification)
 * Inspects `Idempotency-Key` or `X-Idempotency-Key` header.
 *
 * Guarantees:
 * - Duplicate requests return the exact same original response without executing side-effects twice.
 * - Concurrent requests with the same key receive 409 Conflict until the original request completes.
 * - Transient 5xx server errors delete the pending key so client can retry safely.
 */
const idempotencyGuard = async (req, res, next) => {
  const rawKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];

  if (!rawKey || typeof rawKey !== 'string') {
    return next();
  }

  const key = rawKey.trim();
  if (key.length === 0 || key.length > 128) {
    return res.status(400).json({
      error: {
        code: 'INVALID_IDEMPOTENCY_KEY',
        message: 'Idempotency-Key header must be between 1 and 128 characters.',
      },
    });
  }

  try {
    const existing = await IdempotencyKey.findOne({ key });

    if (existing) {
      if (existing.status === 'completed') {
        res.setHeader('X-Idempotent-Replayed', 'true');
        return res.status(existing.statusCode || 200).json(existing.responseBody);
      }

      if (existing.status === 'pending') {
        return res.status(409).json({
          error: {
            code: 'CONCURRENT_REQUEST',
            message: 'A request with this Idempotency-Key is currently processing. Please retry shortly.',
          },
        });
      }
    }

    // Attempt to register pending key
    let keyDoc;
    try {
      keyDoc = await IdempotencyKey.create({
        key,
        user: req.user?._id,
        path: req.originalUrl || req.baseUrl,
        method: req.method,
        status: 'pending',
      });
    } catch (err) {
      if (err.code === 11000) {
        // Race condition: another thread inserted key concurrently
        return res.status(409).json({
          error: {
            code: 'CONCURRENT_REQUEST',
            message: 'A concurrent request with this Idempotency-Key is currently processing.',
          },
        });
      }
      throw err;
    }

    // Intercept response to store result
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    let capturedBody = null;

    res.json = function (body) {
      capturedBody = body;
      return originalJson(body);
    };

    res.send = function (body) {
      if (!capturedBody) {
        try {
          capturedBody = typeof body === 'string' ? JSON.parse(body) : body;
        } catch {
          capturedBody = body;
        }
      }
      return originalSend(body);
    };

    res.on('finish', async () => {
      try {
        if (res.statusCode < 500) {
          await IdempotencyKey.findByIdAndUpdate(keyDoc._id, {
            status: 'completed',
            statusCode: res.statusCode,
            responseBody: capturedBody,
          });
        } else {
          // Allow client retry on 5xx errors
          await IdempotencyKey.findByIdAndDelete(keyDoc._id);
        }
      } catch (err) {
        console.error('[Idempotency Finalize Error]', err.message);
      }
    });

    next();
  } catch (error) {
    console.error('[Idempotency Middleware Error]', error);
    next();
  }
};

module.exports = idempotencyGuard;
