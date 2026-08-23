const Investment = require('../models/Investment');
const PortfolioPerformance = require('../models/PortfolioPerformance');

/**
 * Computes portfolio-level and holding-level return metrics (MOIC, realized/unrealized return)
 */
const calculateInvestmentPerformance = async (investmentId) => {
  const investment = await Investment.findById(investmentId)
    .populate('startup')
    .lean();

  if (!investment) return null;

  const totalInvested = investment.totalInvested || investment.investmentAmount || 1;
  const currentValue = investment.currentValue || investment.investmentAmount || 0;
  const realizedValue = investment.realizedValue || 0;

  const totalValue = realizedValue + currentValue;
  const unrealizedGainLoss = currentValue - totalInvested;
  const totalReturnGain = totalValue - totalInvested;
  const returnMultiple = totalInvested > 0 ? Number((totalValue / totalInvested).toFixed(2)) : 1.0;

  const history = await PortfolioPerformance.find({ investment: investmentId })
    .sort({ createdAt: 1 })
    .lean();

  return {
    investmentId,
    totalInvested,
    currentValue,
    realizedValue,
    totalValue,
    unrealizedGainLoss,
    totalReturnGain,
    returnMultiple,
    history,
  };
};

module.exports = {
  calculateInvestmentPerformance,
};
