const Investment = require('../models/Investment');
const CapitalAllocationPlan = require('../models/CapitalAllocationPlan');
const InvestorStrategy = require('../models/InvestorStrategy');

/**
 * Capital Deployment Planner Service
 */
const calculateCapitalDeploymentStats = async (investorId) => {
  const [investments, activePlan, strategy] = await Promise.all([
    Investment.find({ investor: investorId, isArchived: false }).lean(),
    CapitalAllocationPlan.findOne({ investor: investorId, status: 'Approved' }).sort({ createdAt: -1 }).lean(),
    InvestorStrategy.findOne({ investor: investorId, active: true }).lean(),
  ]);

  const totalDeployed = investments.reduce((acc, i) => acc + (i.totalInvested || i.investmentAmount || 0), 0);
  const totalMarketValue = investments.reduce((acc, i) => acc + (i.currentValue || i.investmentAmount || 0), 0);

  const totalAvailable = activePlan ? activePlan.totalAvailableCapital : (strategy?.targetCapitalDeployment || 5000000);
  const reserveRatio = (strategy && typeof strategy.targetFollowOnReserve === 'number') ? strategy.targetFollowOnReserve / 100 : 0.3;
  const followOnReserve = Math.round(totalAvailable * reserveRatio);
  const remainingForNew = Math.max(0, totalAvailable - totalDeployed - followOnReserve);

  const deploymentRate = totalAvailable > 0 ? Number(((totalDeployed / totalAvailable) * 100).toFixed(1)) : 0;

  return {
    totalAvailableCapital: totalAvailable,
    alreadyDeployedCapital: totalDeployed,
    reservedFollowOnCapital: followOnReserve,
    availableForNewInvestments: remainingForNew,
    deploymentRatePercentage: deploymentRate,
    totalMarketValue,
  };
};

module.exports = {
  calculateCapitalDeploymentStats,
};

