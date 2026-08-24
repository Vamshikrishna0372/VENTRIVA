const mongoose = require('mongoose');
const Investment = require('../models/Investment');

/**
 * Portfolio Concentration Analysis Engine
 */
const analyzePortfolioConcentration = async (investorId) => {
  const matchQuery = (investorId && mongoose.Types.ObjectId.isValid(investorId))
    ? { investor: new mongoose.Types.ObjectId(investorId), isArchived: false }
    : { isArchived: false };

  const holdings = await Investment.find(matchQuery)
    .populate('startup', 'startupName sector stage')
    .sort({ currentValue: -1 })
    .lean();

  if (!holdings || holdings.length === 0) {
    return {
      totalHoldings: 0,
      top1Percentage: 0,
      top3Percentage: 0,
      top5Percentage: 0,
      riskCategory: 'Low',
      sectorDistribution: [],
    };
  }

  const totalValue = holdings.reduce((acc, h) => acc + (h.currentValue || h.investmentAmount || 0), 0);

  const top1Value = holdings[0] ? (holdings[0].currentValue || holdings[0].investmentAmount || 0) : 0;
  const top3Value = holdings.slice(0, 3).reduce((acc, h) => acc + (h.currentValue || h.investmentAmount || 0), 0);
  const top5Value = holdings.slice(0, 5).reduce((acc, h) => acc + (h.currentValue || h.investmentAmount || 0), 0);

  const top1Percentage = totalValue > 0 ? Number(((top1Value / totalValue) * 100).toFixed(1)) : 0;
  const top3Percentage = totalValue > 0 ? Number(((top3Value / totalValue) * 100).toFixed(1)) : 0;
  const top5Percentage = totalValue > 0 ? Number(((top5Value / totalValue) * 100).toFixed(1)) : 0;

  let riskCategory = 'Low';
  if (top1Percentage > 50 || top3Percentage > 80) riskCategory = 'Critical';
  else if (top1Percentage > 35 || top3Percentage > 65) riskCategory = 'High';
  else if (top1Percentage > 25 || top3Percentage > 50) riskCategory = 'Moderate';

  // Sector breakdown
  const sectorMap = {};
  holdings.forEach((h) => {
    const sec = h.startup?.sector || 'Uncategorized';
    const val = h.currentValue || h.investmentAmount || 0;
    sectorMap[sec] = (sectorMap[sec] || 0) + val;
  });

  const sectorDistribution = Object.keys(sectorMap).map((sector) => ({
    sector,
    value: sectorMap[sector],
    percentage: totalValue > 0 ? Number(((sectorMap[sector] / totalValue) * 100).toFixed(1)) : 0,
  }));

  return {
    totalHoldings: holdings.length,
    top1Percentage,
    top3Percentage,
    top5Percentage,
    riskCategory,
    sectorDistribution,
  };
};

module.exports = {
  analyzePortfolioConcentration,
};
