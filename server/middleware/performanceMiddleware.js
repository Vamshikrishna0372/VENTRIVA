const env = require('../config/env');
const logger = require('../services/loggerService');

/**
 * Performance middleware tracking request duration and logging slow endpoints
 */
const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    req.responseTime = duration;

    if (duration > env.SLOW_REQUEST_THRESHOLD_MS) {
      logger.warn(`Slow Request Detected: ${req.method} ${req.originalUrl} (${duration}ms)`, {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        responseTimeMs: duration,
        userId: req.user ? req.user._id : null,
      });
    }
  });

  next();
};

module.exports = performanceMiddleware;
