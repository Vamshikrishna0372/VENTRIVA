const { generatePortfolioAlerts } = require('../services/portfolioIntelligenceService');
const { analyzePortfolioConcentration } = require('../services/portfolioConcentrationService');

/**
 * @desc    Get deterministic risk alerts and intelligence insights
 * @route   GET /api/portfolio-intelligence/alerts
 * @access  Private (Investor + Admin)
 */
const getIntelligenceAlerts = async (req, res, next) => {
  try {
    const investorId = req.user.role === 'investor' ? req.user._id : null;
    const alerts = await generatePortfolioAlerts(investorId);

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get portfolio concentration analysis
 * @route   GET /api/portfolio-intelligence/concentration
 * @access  Private (Investor + Admin)
 */
const getConcentrationAnalysis = async (req, res, next) => {
  try {
    const investorId = req.user.role === 'investor' ? req.user._id : null;
    const concentration = await analyzePortfolioConcentration(investorId);

    res.status(200).json({
      success: true,
      data: concentration,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIntelligenceAlerts,
  getConcentrationAnalysis,
};
