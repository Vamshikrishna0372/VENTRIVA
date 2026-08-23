const analyticsService = require('../services/analyticsService');
const founderInsightService = require('../services/founderInsightService');
const analyticsCacheService = require('../services/analyticsCacheService');

/**
 * @desc    Get founder analytics metrics
 * @route   GET /api/analytics/founder
 * @access  Private (Founder)
 */
const getFounderAnalytics = async (req, res, next) => {
  try {
    const cacheKey = `founder_analytics_${req.user._id}`;
    const cached = analyticsCacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, analytics: cached, cached: true });
    }

    const analytics = await analyticsService.getFounderAnalytics(req.user._id);
    analyticsCacheService.set(cacheKey, analytics, 30000); // 30s cache

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get founder rule-based insights & action recommendations
 * @route   GET /api/analytics/founder/insights
 * @access  Private (Founder)
 */
const getFounderInsights = async (req, res, next) => {
  try {
    const insights = await founderInsightService.generateFounderInsights(req.user._id);
    res.status(200).json({
      success: true,
      count: insights.length,
      insights,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFounderAnalytics,
  getFounderInsights,
};
