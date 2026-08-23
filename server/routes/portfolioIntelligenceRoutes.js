const express = require('express');
const router = express.Router();
const { getIntelligenceAlerts, getConcentrationAnalysis } = require('../controllers/portfolioIntelligenceController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/alerts', authorize('investor', 'admin'), getIntelligenceAlerts);
router.get('/concentration', authorize('investor', 'admin'), getConcentrationAnalysis);

module.exports = router;
