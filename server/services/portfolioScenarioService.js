const Investment = require('../models/Investment');

/**
 * Non-Mutating Portfolio Scenario Simulation Engine
 */
const runPortfolioSimulation = async (investorId, assumptions = {}) => {
  const { valuationChangePercentage = 0, newCapitalDeployment = 0 } = assumptions;

  const investments = await Investment.find({ investor: investorId, isArchived: false }).lean();

  const currentInvested = investments.reduce((acc, i) => acc + (i.totalInvested || i.investmentAmount || 0), 0);
  const currentVal = investments.reduce((acc, i) => acc + (i.currentValue || i.investmentAmount || 0), 0);

  const projectedInvested = currentInvested + (Number(newCapitalDeployment) || 0);
  const projectedValuationFactor = 1 + (Number(valuationChangePercentage) || 0) / 100;
  const projectedPortfolioValue = Math.round(currentVal * projectedValuationFactor + (Number(newCapitalDeployment) || 0));

  const projectedMOIC = projectedInvested > 0 ? Number((projectedPortfolioValue / projectedInvested).toFixed(2)) : 1.0;

  return {
    isSimulation: true, // Non-mutating indicator
    currentInvested,
    currentValue: currentVal,
    projectedInvested,
    projectedPortfolioValue,
    projectedMOIC,
    valuationChangePercentage,
    newCapitalDeployment,
  };
};

module.exports = {
  runPortfolioSimulation,
};
