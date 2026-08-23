const express = require('express');
const router = express.Router();
const { getInvestorProfile, updateInvestorProfile, getInvestorMatches, getInvestors } = require('../controllers/investorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

// Allow founder, investor, admin to list eligible investor profiles for invitations & discovery
router.get('/', authorize('founder', 'investor', 'admin'), getInvestors);

// Investor-only endpoints
router.get('/me', authorize('investor'), getInvestorProfile);
router.put('/me', authorize('investor'), updateInvestorProfile);
router.get('/matches', authorize('investor'), getInvestorMatches);

module.exports = router;
