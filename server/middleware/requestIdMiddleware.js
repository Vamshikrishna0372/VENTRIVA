const { v4: uuidv4 } = require('crypto');

/**
 * X-Request-ID Correlation Tracing Middleware
 */
const requestIdMiddleware = (req, res, next) => {
  const existingId = req.headers['x-request-id'];
  const requestId = existingId && /^[a-zA-Z0-9\-_]+$/.test(existingId) ? existingId : `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

module.exports = requestIdMiddleware;
