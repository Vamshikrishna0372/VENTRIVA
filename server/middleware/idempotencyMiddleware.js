const crypto = require('crypto');

const idempotencyStore = new Map();
const TTL_MS = 60 * 60 * 1000; // 1 hour TTL

/**
 * Idempotency Key Middleware for Critical POST Operations
 */
const idempotencyMiddleware = (req, res, next) => {
  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey) {
    return next();
  }

  const userId = req.user ? req.user._id.toString() : 'anonymous';
  const key = `${userId}:${req.path}:${idempotencyKey}`;

  const cachedResponse = idempotencyStore.get(key);
  if (cachedResponse && Date.now() < cachedResponse.expiresAt) {
    res.setHeader('X-Cache-Hit', 'Idempotent');
    return res.status(cachedResponse.status).json(cachedResponse.body);
  }

  // Intercept json method to store result
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      idempotencyStore.set(key, {
        status: res.statusCode,
        body,
        expiresAt: Date.now() + TTL_MS,
      });
    }
    return originalJson(body);
  };

  next();
};

module.exports = idempotencyMiddleware;
