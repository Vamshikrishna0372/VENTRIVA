const express = require('express');
const router = express.Router();
const {
  getAdminDashboardMetrics,
  getAdminUsers,
  getAdminUserById,
  updateUserStatus,
  updateUserVerification,
  getAdminStartups,
  getAdminStartupById,
  updateStartupVerification,
  updateStartupPublication,
  createModerationFlag,
  getModerationFlags,
  updateModerationFlag,
  getAdminAuditLogs,
  getAdminAnalytics,
} = require('../controllers/adminController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Publicly accessible for authenticated users (Founders/Investors/Admins) to report flags
router.post('/flags', protect, createModerationFlag);

// Protected Admin-Only Routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard & Analytics
router.get('/dashboard', getAdminDashboardMetrics);
router.get('/analytics', getAdminAnalytics);

// User Management
router.get('/users', getAdminUsers);
router.get('/users/:id', getAdminUserById);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/verification', updateUserVerification);

// Startup Governance & Verification
router.get('/startups', getAdminStartups);
router.get('/startups/:id', getAdminStartupById);
router.patch('/startups/:id/verification', updateStartupVerification);
router.patch('/startups/:id/publication', updateStartupPublication);

// Moderation & Audit Logs
router.get('/flags', getModerationFlags);
router.patch('/flags/:id', updateModerationFlag);
router.get('/audit-logs', getAdminAuditLogs);

module.exports = router;
