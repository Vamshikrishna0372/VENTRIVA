const express = require('express');
const router = express.Router();
const { getOpportunityRanking } = require('../controllers/opportunityRankingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('investor', 'admin'));

router.get('/ranking', getOpportunityRanking);

module.exports = router;
