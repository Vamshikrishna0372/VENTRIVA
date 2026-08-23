const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter for Sensitive Authentication Endpoints (Login/Register)
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 login/registration attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * Rate Limiter for File Upload Endpoints
 */
const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 file uploads per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many document upload requests. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * Rate Limiter for Communication & Meetings Endpoints
 */
const communicationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Max 5000 communication actions per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many communication requests. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

module.exports = {
  authRateLimiter,
  uploadRateLimiter,
  communicationRateLimiter,
};
