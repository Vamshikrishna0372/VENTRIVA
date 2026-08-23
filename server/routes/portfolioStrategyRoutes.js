const express = require('express');
const router = express.Router();
const { getStrategyHealthOverview } = require('../controllers/portfolioStrategyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('investor', 'admin'));

router.get('/health', getStrategyHealthOverview);

module.exports = router;
