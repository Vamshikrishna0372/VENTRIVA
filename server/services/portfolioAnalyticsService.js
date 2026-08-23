const mongoose = require('mongoose');
const Investment = require('../models/Investment');

/**
 * Aggregates portfolio financial metrics using MongoDB Pipelines
 */
const getPortfolioAnalytics = async (investorId) => {
  const matchQuery = investorId ? { investor: new mongoose.Types.ObjectId(investorId), isArchived: false } : { isArchived: false };

  const summary = await Investment.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalCompanies: { $sum: 1 },
        totalInvestedCapital: { $sum: '$investmentAmount' },
        totalCurrentValue: { $sum: '$currentValue' },
        totalRealizedValue: { $sum: '$realizedValue' },
        totalFollowOnInvested: { $sum: '$followOnInvested' },
        avgOwnership: { $avg: '$ownershipPercentage' },
        avgHealthScore: { $avg: '$healthScore' },
      },
    },
  ]);

  const stats = summary[0] || {
    totalCompanies: 0,
    totalInvestedCapital: 0,
    totalCurrentValue: 0,
    totalRealizedValue: 0,
    totalFollowOnInvested: 0,
    avgOwnership: 0,
    avgHealthScore: 80,
  };

  const unrealizedGainLoss = stats.totalCurrentValue - stats.totalInvestedCapital;
  const returnMultiple = stats.totalInvestedCapital > 0
    ? Number((stats.totalCurrentValue / stats.totalInvestedCapital).toFixed(2))
    : 1.0;

  // Breakdown by Health Status
  const healthBreakdown = await Investment.aggregate([
    { $match: matchQuery },
    { $group: { _id: '$healthStatus', count: { $sum: 1 } } },
  ]);

  // Breakdown by Investment Status
  const statusBreakdown = await Investment.aggregate([
    { $match: matchQuery },
    { $group: { _id: '$investmentStatus', count: { $sum: 1 } } },
  ]);

  return {
    ...stats,
    unrealizedGainLoss,
    returnMultiple,
    healthBreakdown,
    statusBreakdown,
  };
};

module.exports = {
  getPortfolioAnalytics,
};
