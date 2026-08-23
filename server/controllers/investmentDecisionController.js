const InvestmentDecision = require('../models/InvestmentDecision');
const Startup = require('../models/Startup');

/**
 * @desc    Record or update a private investment decision
 * @route   POST /api/investment-decisions
 * @access  Private (Investor only)
 */
const recordDecision = async (req, res, next) => {
  try {
    const { startupId, decisionType, convictionScore, recommendedInvestmentAmount, rationale, keyRisks } = req.body;

    const startup = await Startup.findById(startupId);
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    const decision = await InvestmentDecision.create({
      investor: req.user._id,
      startup: startupId,
      decisionType: decisionType || 'Invest',
      decisionStatus: 'Approved',
      convictionScore: convictionScore || 80,
      recommendedInvestmentAmount: recommendedInvestmentAmount || 250000,
      rationale: rationale || '',
      keyRisks: keyRisks || '',
    });

    res.status(201).json({
      success: true,
      message: 'Investment decision recorded successfully',
      data: decision,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get private investment decisions
 * @route   GET /api/investment-decisions
 * @access  Private (Investor only)
 */
const getMyDecisions = async (req, res, next) => {
  try {
    const decisions = await InvestmentDecision.find({ investor: req.user._id })
      .populate('startup', 'startupName sector stage logo')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: decisions.length,
      data: decisions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordDecision,
  getMyDecisions,
};
