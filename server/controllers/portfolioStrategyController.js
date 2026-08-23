const { calculateStrategyHealthScore } = require('../services/portfolioStrategyHealthService');

/**
 * @desc    Get strategy health overview
 * @route   GET /api/portfolio-strategy/health
 * @access  Private (Investor + Admin)
 */
const getStrategyHealthOverview = async (req, res, next) => {
  try {
    const investorId = req.user.role === 'investor' ? req.user._id : null;
    const health = await calculateStrategyHealthScore(investorId);

    res.status(200).json({
      success: true,
      data: health,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStrategyHealthOverview,
};
