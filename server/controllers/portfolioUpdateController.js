const PortfolioUpdate = require('../models/PortfolioUpdate');
const Investment = require('../models/Investment');
const Startup = require('../models/Startup');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const { calculatePortfolioHealth } = require('../services/portfolioHealthService');

/**
 * @desc    Submit a new monthly/quarterly founder portfolio progress update
 * @route   POST /api/portfolio-updates
 * @access  Private (Founder only)
 */
const submitPortfolioUpdate = async (req, res, next) => {
  try {
    const {
      investmentId,
      reportingPeriod,
      revenue,
      revenueGrowth,
      monthlyRecurringRevenue,
      annualRecurringRevenue,
      customerCount,
      burnRate,
      runwayMonths,
      cashBalance,
      majorMilestones,
      keyWins,
      keyChallenges,
      founderNotes,
      outlook,
    } = req.body;

    const investment = await Investment.findById(investmentId);
    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment record not found' });
    }

    if (investment.founder.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to submit updates for this investment' });
    }

    const update = await PortfolioUpdate.create({
      investment: investmentId,
      startup: investment.startup,
      founder: req.user._id,
      reportingPeriod,
      revenue: revenue || 0,
      revenueGrowth: revenueGrowth || 0,
      monthlyRecurringRevenue: monthlyRecurringRevenue || 0,
      annualRecurringRevenue: annualRecurringRevenue || 0,
      customerCount: customerCount || 0,
      burnRate: burnRate || 0,
      runwayMonths: runwayMonths || 12,
      cashBalance: cashBalance || 0,
      majorMilestones: majorMilestones || '',
      keyWins: keyWins || '',
      keyChallenges: keyChallenges || '',
      founderNotes: founderNotes || '',
      outlook: outlook || 'Stable',
      status: 'Submitted',
    });

    // Re-calculate deterministic portfolio health score
    const healthResult = calculatePortfolioHealth(
      { runwayMonths, revenueGrowth },
      update,
      []
    );

    investment.healthScore = healthResult.score;
    investment.healthStatus = healthResult.healthStatus;
    await investment.save();

    // Log Activity
    await ActivityLog.create({
      activityType: 'portfolio',
      investment: investmentId,
      startup: investment.startup,
      actor: req.user._id,
      action: 'PORTFOLIO_UPDATE_SUBMITTED',
      description: `Founder update submitted for period ${reportingPeriod} (Health: ${healthResult.healthStatus})`,
    });

    // Generate Notification for Investor
    await Notification.create({
      recipient: investment.investor,
      sender: req.user._id,
      type: 'DEAL_UPDATE',
      title: `New Portfolio Update Submitted (${reportingPeriod})`,
      message: `Founder has submitted the portfolio progress report for period ${reportingPeriod}.`,
      link: `/investor/portfolio/${investmentId}`,
    });

    res.status(201).json({
      success: true,
      message: 'Portfolio update submitted successfully',
      data: update,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get updates for an investment
 * @route   GET /api/portfolio-updates/investment/:investmentId
 * @access  Private (Participants + Admin)
 */
const getUpdatesForInvestment = async (req, res, next) => {
  try {
    const { investmentId } = req.params;
    const investment = await Investment.findById(investmentId);
    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment record not found' });
    }

    const isInvestor = investment.investor.toString() === req.user._id.toString();
    const isFounder = investment.founder.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isInvestor && !isFounder && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these portfolio updates' });
    }

    const updates = await PortfolioUpdate.find({ investment: investmentId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: updates.length,
      data: updates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Acknowledge a founder portfolio update
 * @route   POST /api/portfolio-updates/:id/acknowledge
 * @access  Private (Investor only)
 */
const acknowledgePortfolioUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = await PortfolioUpdate.findById(id);

    if (!update) {
      return res.status(404).json({ success: false, message: 'Portfolio update not found' });
    }

    update.status = 'Acknowledged';
    update.acknowledgedAt = new Date();
    await update.save();

    res.status(200).json({
      success: true,
      message: 'Portfolio update acknowledged',
      data: update,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitPortfolioUpdate,
  getUpdatesForInvestment,
  acknowledgePortfolioUpdate,
};
