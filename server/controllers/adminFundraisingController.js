const FundraisingRound = require('../models/FundraisingRound');
const InvestorCommitment = require('../models/InvestorCommitment');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');

/**
 * Platform-wide Admin Fundraising Governance Controller
 */
exports.getAdminRounds = async (req, res, next) => {
  try {
    const { status, roundType, search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    let filter = {};

    if (status) filter.status = status;
    if (roundType) filter.roundType = roundType;
    if (search) filter.roundName = { $regex: search, $options: 'i' };

    const total = await FundraisingRound.countDocuments(filter);
    const rounds = await FundraisingRound.find(filter)
      .populate('startup', 'startupName logo sector stage')
      .populate('founder', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: rounds.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      data: rounds,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Platform-wide Admin Fundraising Analytics Metrics
 */
exports.getAdminFundraisingAnalytics = async (req, res, next) => {
  try {
    const totalRounds = await FundraisingRound.countDocuments({ isArchived: false });
    const activeRounds = await FundraisingRound.countDocuments({
      status: { $in: ['Open', 'Soft Commitments', 'In Due Diligence', 'Term Sheet Stage', 'Closing'] },
      isArchived: false,
    });
    const closedRounds = await FundraisingRound.countDocuments({ status: 'Closed', isArchived: false });

    // Aggregate capital metrics across all rounds
    const roundTotals = await FundraisingRound.aggregate([
      { $match: { isArchived: false } },
      {
        $group: {
          _id: null,
          totalTarget: { $sum: '$targetAmount' },
          totalCommitted: { $sum: '$committedAmount' },
          totalFunded: { $sum: '$fundedAmount' },
          avgTarget: { $avg: '$targetAmount' },
        },
      },
    ]);

    const stats = roundTotals[0] || { totalTarget: 0, totalCommitted: 0, totalFunded: 0, avgTarget: 0 };

    // Stage distribution
    const roundsByStage = await FundraisingRound.aggregate([
      { $match: { isArchived: false } },
      { $group: { _id: '$roundType', count: { $sum: 1 }, target: { $sum: '$targetAmount' } } },
    ]);

    // Status distribution
    const roundsByStatus = await FundraisingRound.aggregate([
      { $match: { isArchived: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRounds,
        activeRounds,
        closedRounds,
        totalTargetCapital: stats.totalTarget,
        totalCommittedCapital: stats.totalCommitted,
        totalFundedCapital: stats.totalFunded,
        averageRoundSize: Math.round(stats.avgTarget || 0),
        roundsByStage,
        roundsByStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Platform-wide Audit Activity Trail
 */
exports.getAdminFundraisingActivity = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const total = await ActivityLog.countDocuments({ activityType: 'fundraising' });
    const activity = await ActivityLog.find({ activityType: 'fundraising' })
      .populate('actor', 'name email role avatar')
      .populate('fundraisingRound', 'roundName')
      .populate('startup', 'startupName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: activity.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};
