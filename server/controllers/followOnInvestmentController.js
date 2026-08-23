const FollowOnInvestment = require('../models/FollowOnInvestment');
const Investment = require('../models/Investment');
const OwnershipEvent = require('../models/OwnershipEvent');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

/**
 * @desc    Propose a follow-on or pro-rata investment opportunity
 * @route   POST /api/follow-on-investments
 * @access  Private (Investor only)
 */
const createFollowOnOpportunity = async (req, res, next) => {
  try {
    const { investmentId, amount, round, reason, ownershipAfter } = req.body;

    const investment = await Investment.findById(investmentId);
    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment record not found' });
    }

    if (investment.investor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to propose follow-on investment' });
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Follow-on investment amount must be positive' });
    }

    const followOn = await FollowOnInvestment.create({
      investment: investmentId,
      investor: req.user._id,
      startup: investment.startup,
      amount,
      round: round || 'Series A',
      reason: reason || 'Pro-rata participation',
      ownershipBefore: investment.ownershipPercentage || 0,
      ownershipAfter: ownershipAfter || investment.ownershipPercentage || 0,
      status: 'Proposed',
    });

    await ActivityLog.create({
      activityType: 'portfolio',
      investment: investmentId,
      startup: investment.startup,
      actor: req.user._id,
      action: 'FOLLOW_ON_PROPOSED',
      description: `Follow-on investment proposed: $${amount.toLocaleString()} for ${round || 'next round'}`,
    });

    res.status(201).json({
      success: true,
      message: 'Follow-on opportunity recorded successfully',
      data: followOn,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get follow-on investment opportunities
 * @route   GET /api/follow-on-investments
 * @access  Private
 */
const getFollowOnOpportunities = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'investor') {
      query.investor = req.user._id;
    }

    const opportunities = await FollowOnInvestment.find(query)
      .populate('investment')
      .populate('startup', 'startupName sector logo')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: opportunities.length,
      data: opportunities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve or Decline follow-on opportunity
 * @route   POST /api/follow-on-investments/:id/approve (or decline)
 * @access  Private (Investor only)
 */
const updateFollowOnStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const followOn = await FollowOnInvestment.findById(req.params.id);

    if (!followOn) {
      return res.status(404).json({ success: false, message: 'Follow-on opportunity not found' });
    }

    if (followOn.investor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this follow-on opportunity' });
    }

    followOn.status = status;
    await followOn.save();

    res.status(200).json({
      success: true,
      message: `Follow-on opportunity status updated to ${status}`,
      data: followOn,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Convert approved follow-on into completed investment capital
 * @route   POST /api/follow-on-investments/:id/convert
 * @access  Private (Investor only)
 */
const convertFollowOnToInvestment = async (req, res, next) => {
  try {
    const followOn = await FollowOnInvestment.findById(req.params.id);

    if (!followOn) {
      return res.status(404).json({ success: false, message: 'Follow-on opportunity not found' });
    }

    if (followOn.status === 'Completed' || followOn.status === 'Invested') {
      return res.status(400).json({ success: false, message: 'Follow-on opportunity already converted/completed' });
    }

    const investment = await Investment.findById(followOn.investment);
    if (!investment) {
      return res.status(404).json({ success: false, message: 'Primary investment record not found' });
    }

    // Update Investment totals
    investment.followOnInvested = (investment.followOnInvested || 0) + followOn.amount;
    investment.totalInvested = (investment.totalInvested || investment.investmentAmount) + followOn.amount;
    const oldOwnership = investment.ownershipPercentage || 0;
    investment.ownershipPercentage = followOn.ownershipAfter || oldOwnership;
    await investment.save();

    // Mark Follow-On Completed
    followOn.status = 'Completed';
    await followOn.save();

    // Record Ownership Event
    await OwnershipEvent.create({
      investment: investment._id,
      startup: investment.startup,
      investor: req.user._id,
      eventType: 'Follow-On Investment',
      previousOwnership: oldOwnership,
      newOwnership: investment.ownershipPercentage,
      dilutionPercentage: 0,
      reason: `Completed follow-on round ${followOn.round}`,
      createdBy: req.user._id,
    });

    // Log Activity
    await ActivityLog.create({
      activityType: 'portfolio',
      investment: investment._id,
      startup: investment.startup,
      actor: req.user._id,
      action: 'FOLLOW_ON_COMPLETED',
      description: `Follow-on investment completed: $${followOn.amount.toLocaleString()} deployed`,
    });

    res.status(200).json({
      success: true,
      message: 'Follow-on investment converted and deployed successfully',
      data: followOn,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFollowOnOpportunity,
  getFollowOnOpportunities,
  updateFollowOnStatus,
  convertFollowOnToInvestment,
};
