const express = require('express');
const router = express.Router();
const { getFounderAnalytics, getFounderInsights } = require('../controllers/founderAnalyticsController');
const { getInvestorAnalytics, getInvestorInsights, getInvestorRecommendations } = require('../controllers/investorAnalyticsController');
const { getStartupAnalytics } = require('../controllers/startupAnalyticsController');
const { getAdminOverviewAnalytics } = require('../controllers/adminAnalyticsController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

// Founder Analytics Endpoints
router.get('/founder', authorize('founder'), getFounderAnalytics);
router.get('/founder/insights', authorize('founder'), getFounderInsights);

// Investor Analytics & Intelligence Endpoints
router.get('/investor', authorize('investor'), getInvestorAnalytics);
router.get('/investor/insights', authorize('investor'), getInvestorInsights);
router.get('/investor/recommendations', authorize('investor'), getInvestorRecommendations);

// Startup Analytics Endpoint
router.get('/startups/:startupId', getStartupAnalytics);

// Admin Overview Analytics Endpoint
router.get('/admin/overview', authorize('admin'), getAdminOverviewAnalytics);

module.exports = router;
