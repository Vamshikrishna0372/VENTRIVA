const analyticsService = require('../services/analyticsService');
const analyticsCacheService = require('../services/analyticsCacheService');

/**
 * @desc    Get admin platform-level overview analytics
 * @route   GET /api/analytics/admin/overview
 * @access  Private (Admin)
 */
const getAdminOverviewAnalytics = async (req, res, next) => {
  try {
    const { period } = req.query;
    const cacheKey = `admin_overview_analytics_${period || 'all'}`;
    const cached = analyticsCacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, analytics: cached, cached: true });
    }

    const analytics = await analyticsService.getAdminOverviewAnalytics(period);
    analyticsCacheService.set(cacheKey, analytics, 30000);

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminOverviewAnalytics,
};
