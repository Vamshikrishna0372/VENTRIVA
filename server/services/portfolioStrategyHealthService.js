const { calculateCapitalDeploymentStats } = require('./capitalDeploymentService');
const { analyzePortfolioConcentration } = require('./portfolioConcentrationService');

/**
 * 0-100 Strategy Health Score Engine
 */
const calculateStrategyHealthScore = async (investorId) => {
  const deployment = await calculateCapitalDeploymentStats(investorId);
  const concentration = await analyzePortfolioConcentration(investorId);

  let score = 80;
  const warnings = [];
  const strengths = [];

  // Concentration check
  if (concentration.riskCategory === 'Critical') {
    score -= 20;
    warnings.push('High concentration risk: top holding represents >50% of portfolio');
  } else if (concentration.riskCategory === 'Low') {
    score += 10;
    strengths.push('Optimal portfolio diversification across sectors');
  }

  // Deployment check
  if (deployment.deploymentRatePercentage > 90) {
    score -= 10;
    warnings.push('Low available liquidity: >90% capital deployed');
  } else if (deployment.deploymentRatePercentage >= 40) {
    score += 10;
    strengths.push('Healthy capital deployment pace');
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  let healthCategory = 'Healthy';
  if (finalScore >= 90) healthCategory = 'Excellent';
  else if (finalScore >= 75) healthCategory = 'Healthy';
  else if (finalScore >= 55) healthCategory = 'Watch';
  else if (finalScore >= 35) healthCategory = 'At Risk';
  else healthCategory = 'Critical';

  return {
    score: finalScore,
    healthCategory,
    warnings,
    strengths,
    deployment,
    concentration,
  };
};

module.exports = {
  calculateStrategyHealthScore,
};
