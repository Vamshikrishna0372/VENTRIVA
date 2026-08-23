const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { authRateLimiter } = require('../middleware/rateLimitMiddleware');

// Public Authentication Endpoints (Subject to Rate Limiting)
router.post('/register', authRateLimiter, registerUser);
router.post('/login', authRateLimiter, loginUser);
router.post('/logout', logoutUser);

// Authenticated User Identity Endpoint (Session Restoration - Unthrottled)
router.get('/me', protect, getMe);

// Phase 2 Security Verification & Protected Test Endpoints
router.get('/protected', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to protected endpoint',
    user: req.user,
  });
});

router.get('/founder-test', protect, authorize('founder'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted: Verified Founder role',
    user: req.user,
  });
});

router.get('/investor-test', protect, authorize('investor'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted: Verified Investor role',
    user: req.user,
  });
});

router.get('/admin-test', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted: Verified Admin role',
    user: req.user,
  });
});

module.exports = router;
