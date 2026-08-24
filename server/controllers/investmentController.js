const mongoose = require('mongoose');
const Investment = require('../models/Investment');
const Deal = require('../models/Deal');
const Startup = require('../models/Startup');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const { calculatePortfolioHealth } = require('../services/portfolioHealthService');
const { getPortfolioAnalytics } = require('../services/portfolioAnalyticsService');

/**
 * @desc    Convert closed Deal Room into an Investment portfolio record
 * @route   POST /api/investments/from-deal/:dealId
 * @access  Private (Investor only)
 */
const createInvestmentFromDeal = async (req, res, next) => {
  try {
    const { dealId } = req.params;
    const { ownershipPercentage, sharesOwned, sharePrice } = req.body;

    const deal = await Deal.findById(dealId);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal Room not found' });
    }

    if (deal.investor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to convert this Deal Room' });
    }

    // Check for duplicate investment
    let existingInvestment = await Investment.findOne({ deal: dealId });
    if (existingInvestment) {
      return res.status(200).json({
        success: true,
        message: 'Investment record already exists for this deal',
        data: existingInvestment,
      });
    }

    const investmentAmount = deal.targetInvestment || 100000;
    const postMoneyValuation = deal.valuation || investmentAmount;
    const currentValuation = postMoneyValuation;
    const currentValue = investmentAmount;

    const investment = await Investment.create({
      deal: dealId,
      startup: deal.startup,
      investor: deal.investor,
      founder: deal.founder,
      investmentType: deal.dealType.includes('SAFE') ? 'SAFE' : 'Equity',
      investmentStatus: 'Active',
      investmentAmount,
      ownershipPercentage: ownershipPercentage || 10,
      sharesOwned: sharesOwned || 0,
      sharePrice: sharePrice || 0,
      preMoneyValuation: deal.valuation || investmentAmount,
      postMoneyValuation,
      currentValuation,
      currentValue,
      totalInvested: investmentAmount,
      investmentDate: new Date(),
    });

    // Update Deal Status to Closed/Invested
    deal.status = 'Invested';
    await deal.save();

    // Log Activity
    await ActivityLog.create({
      activityType: 'portfolio',
      investment: investment._id,
      startup: deal.startup,
      actor: req.user._id,
      action: 'INVESTMENT_CREATED',
      description: `Investment recorded: $${investmentAmount.toLocaleString()} committed`,
      metadata: { newValue: 'Active' },
    });

    // Generate Notification for Founder
    await Notification.create({
      recipient: deal.founder,
      sender: req.user._id,
      type: 'DEAL_UPDATE',
      title: 'Investment Completed & Portfolio Active! 🎉',
      message: `Your investment with the investor is officially active in your Portfolio Workspace.`,
      link: `/founder/portfolio`,
    });

    res.status(201).json({
      success: true,
      message: 'Investment portfolio record created successfully',
      data: investment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's portfolio investments (Investor or Founder)
 * @route   GET /api/investments
 * @access  Private
 */
const getMyInvestments = async (req, res, next) => {
  try {
    let query = { isArchived: false };
    if (req.user.role === 'founder') {
      query.founder = req.user._id;
    } else if (req.user.role === 'investor') {
      query.investor = req.user._id;
    }

    const investments = await Investment.find(query)
      .populate('startup', 'startupName tagline logo sector stage profileVisibility')
      .populate('investor', 'name email avatar organization')
      .populate('founder', 'name email avatar bio')
      .sort({ investmentDate: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: investments.length,
      data: investments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single investment detail by ID
 * @route   GET /api/investments/:id
 * @access  Private (Participants + Admin)
 */
const getInvestmentById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Invalid investment record ID format' });
    }

    const investment = await Investment.findById(req.params.id)
      .populate('startup')
      .populate('investor', 'name email avatar organization')
      .populate('founder', 'name email avatar bio');

    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment record not found' });
    }

    const isInvestor = investment.investor && investment.investor._id.toString() === req.user._id.toString();
    const isFounder = investment.founder && investment.founder._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isInvestor && !isFounder && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this investment record' });
    }

    res.status(200).json({
      success: true,
      data: investment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated portfolio analytics
 * @route   GET /api/investments/portfolio/analytics
 * @access  Private (Investor + Admin)
 */
const getPortfolioAnalyticsEndpoint = async (req, res, next) => {
  try {
    const analytics = await getPortfolioAnalytics(req.user._id, req.user.role);
    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update investment status & health
 * @route   PATCH /api/investments/:id/status
 * @access  Private (Investor + Admin)
 */
const updateInvestmentStatus = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Invalid investment record ID format' });
    }

    const { investmentStatus, healthStatus } = req.body;
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment record not found' });
    }

    if (investment.investor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this investment record' });
    }

    if (investmentStatus) investment.investmentStatus = investmentStatus;
    if (healthStatus) {
      investment.healthStatus = healthStatus;
      if (healthStatus === 'Excellent') investment.healthScore = 95;
      else if (healthStatus === 'Healthy') investment.healthScore = 80;
      else if (healthStatus === 'Watch') investment.healthScore = 65;
      else if (healthStatus === 'At Risk') investment.healthScore = 45;
      else if (healthStatus === 'Critical') investment.healthScore = 20;
    }

    await investment.save();

    res.status(200).json({
      success: true,
      message: 'Investment record status updated successfully',
      data: investment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvestmentFromDeal,
  getMyInvestments,
  getInvestmentById,
  getPortfolioAnalyticsEndpoint,
  updateInvestmentStatus,
};
