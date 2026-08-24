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

  let fitScore = 70;
  const matched = [];
  const mismatched = [];

  // 1. Sector fit check (from targetSectorAllocations or preferredSectors)
  const sectorList = [];
  if (strategy.targetSectorAllocations && strategy.targetSectorAllocations.length > 0) {
    sectorList.push(...strategy.targetSectorAllocations.map((s) => s.sector));
  }
  if (strategy.preferredSectors && strategy.preferredSectors.length > 0) {
    sectorList.push(...strategy.preferredSectors);
  }

  if (sectorList.length > 0) {
    if (sectorList.some((s) => s.toLowerCase() === (startup.sector || '').toLowerCase())) {
      fitScore += 15;
      matched.push(`Target sector match: ${startup.sector}`);
    } else {
      fitScore -= 10;
      mismatched.push(`Sector ${startup.sector} not in mandate`);
    }
  } else {
    fitScore += 10;
    matched.push('Broad sector thesis');
  }

  // 2. Stage fit check
  const stageList = [];
  if (strategy.targetStageAllocations && strategy.targetStageAllocations.length > 0) {
    stageList.push(...strategy.targetStageAllocations.map((s) => s.stage));
  }
  if (strategy.preferredStages && strategy.preferredStages.length > 0) {
    stageList.push(...strategy.preferredStages);
  }

  if (stageList.length > 0) {
    if (stageList.some((st) => st.toLowerCase() === (startup.stage || '').toLowerCase())) {
      fitScore += 15;
      matched.push(`Target stage match: ${startup.stage}`);
    } else {
      fitScore -= 10;
      mismatched.push(`Stage ${startup.stage} outside target`);
    }
  } else {
    fitScore += 10;
    matched.push('Broad stage thesis');
  }

  // 3. Ticket size / Check size check
  const checkSize = strategy.targetInitialCheckSize || strategy.minimumInvestment || 0;
  const fundingReq = startup.fundingRequired || 0;
  if (checkSize > 0 && fundingReq > 0) {
    if (fundingReq >= checkSize * 0.5 && fundingReq <= checkSize * 10) {
      fitScore += 10;
      matched.push(`Target check size fit ($${checkSize.toLocaleString()})`);
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

