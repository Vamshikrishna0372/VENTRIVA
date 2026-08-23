const analyticsService = require('../services/analyticsService');
const investorInsightService = require('../services/investorInsightService');
const recommendationService = require('../services/recommendationService');
const analyticsCacheService = require('../services/analyticsCacheService');

/**
 * @desc    Get investor portfolio & deal intelligence analytics
 * @route   GET /api/analytics/investor
 * @access  Private (Investor)
 */
const getInvestorAnalytics = async (req, res, next) => {
  try {
    const cacheKey = `investor_analytics_${req.user._id}`;
    const cached = analyticsCacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, analytics: cached, cached: true });
    }

    const analytics = await analyticsService.getInvestorAnalytics(req.user._id);
    analyticsCacheService.set(cacheKey, analytics, 30000);

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get investor rule-based insights
 * @route   GET /api/analytics/investor/insights
 * @access  Private (Investor)
 */
const getInvestorInsights = async (req, res, next) => {
  try {
    const insights = await investorInsightService.generateInvestorInsights(req.user._id);
    res.status(200).json({
      success: true,
      count: insights.length,
      insights,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get personalized startup recommendations with Platform Match Scores
 * @route   GET /api/analytics/investor/recommendations
 * @access  Private (Investor)
 */
const getInvestorRecommendations = async (req, res, next) => {
  try {
    const { sector, stage, businessModel, minMatchScore } = req.query;
    const recommendations = await recommendationService.getInvestorRecommendations(req.user._id, {
      sector,
      stage,
      businessModel,
      minMatchScore,
    });

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvestorAnalytics,
  getInvestorInsights,
  getInvestorRecommendations,
};
