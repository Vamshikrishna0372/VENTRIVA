const express = require('express');
const router = express.Router();
const {
  getSystemHealth,
  getSystemMetrics,
  getSystemJobs,
  getSystemPerformance,
} = require('../controllers/systemController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/health', getSystemHealth);
router.get('/metrics', getSystemMetrics);
router.get('/jobs', getSystemJobs);
router.get('/performance', getSystemPerformance);

module.exports = router;
