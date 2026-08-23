const Investment = require('../models/Investment');
const CapitalAllocationPlan = require('../models/CapitalAllocationPlan');

/**
 * Capital Deployment Planner Service
 */
const calculateCapitalDeploymentStats = async (investorId) => {
  const investments = await Investment.find({ investor: investorId, isArchived: false }).lean();

  const totalDeployed = investments.reduce((acc, i) => acc + (i.totalInvested || i.investmentAmount || 0), 0);
  const totalMarketValue = investments.reduce((acc, i) => acc + (i.currentValue || i.investmentAmount || 0), 0);

  const activePlan = await CapitalAllocationPlan.findOne({ investor: investorId, status: 'Approved' }).lean();

  const totalAvailable = activePlan ? activePlan.totalAvailableCapital : 5000000;
  const followOnReserve = Math.round(totalAvailable * 0.3); // 30% default follow-on reserve
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
