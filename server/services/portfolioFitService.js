/**
 * Strategy Alignment & Portfolio Fit Engine
 */
const calculatePortfolioFit = (startup = {}, strategy = null) => {
  if (!strategy) {
    return {
      portfolioFitScore: 80,
      strategicFitScore: 80,
      matchedCriteria: ['Default strategy fit'],
      mismatchedCriteria: [],
    };
  }

  let fitScore = 80;
  const matched = [];
  const mismatched = [];

  // Check sector fit
  if (strategy.targetSectorAllocations && strategy.targetSectorAllocations.length > 0) {
    const sectors = strategy.targetSectorAllocations.map((s) => s.sector);
    if (sectors.includes(startup.sector)) {
      fitScore += 10;
      matched.push(`Target sector match: ${startup.sector}`);
    } else {
      fitScore -= 10;
      mismatched.push(`Sector ${startup.sector} not in target mandate`);
    }
  }

  // Check stage fit
  if (strategy.targetStageAllocations && strategy.targetStageAllocations.length > 0) {
    const stages = strategy.targetStageAllocations.map((s) => s.stage);
    if (stages.includes(startup.stage)) {
      fitScore += 10;
      matched.push(`Target stage match: ${startup.stage}`);
    } else {
      fitScore -= 10;
      mismatched.push(`Stage ${startup.stage} outside primary target`);
    }
  }

  const finalFit = Math.min(100, Math.max(0, Math.round(fitScore)));

  return {
    portfolioFitScore: finalFit,
    strategicFitScore: finalFit,
    matchedCriteria: matched,
    mismatchedCriteria: mismatched,
  };
};

module.exports = {
  calculatePortfolioFit,
};
