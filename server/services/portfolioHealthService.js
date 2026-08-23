/**
 * Deterministic Portfolio Health Scoring Engine (0-100)
 */
const calculatePortfolioHealth = (metrics = {}, latestUpdate = null, milestones = []) => {
  let score = 75; // Baseline score
  const riskFactors = [];
  const positiveSignals = [];

  // Factor 1: Runway Months Evaluation
  const runway = latestUpdate?.runwayMonths || metrics?.runwayMonths || 12;
  if (runway >= 12) {
    score += 10;
    positiveSignals.push(`Healthy cash runway: ${runway} months remaining`);
  } else if (runway >= 6) {
    score += 0;
  } else if (runway >= 3) {
    score -= 15;
    riskFactors.push(`Short cash runway: only ${runway} months remaining`);
  } else {
    score -= 30;
    riskFactors.push(`CRITICAL: Extreme cash runway risk (<3 months remaining)`);
  }

  // Factor 2: Revenue Growth
  const revGrowth = latestUpdate?.revenueGrowth || metrics?.revenueGrowth || 0;
  if (revGrowth >= 20) {
    score += 10;
    positiveSignals.push(`Strong revenue growth: +${revGrowth}%`);
  } else if (revGrowth < 0) {
    score -= 10;
    riskFactors.push(`Declining revenue: ${revGrowth}%`);
  }

  // Factor 3: Milestone Execution Ratio
  if (milestones.length > 0) {
    const completedCount = milestones.filter((m) => m.status === 'Completed').length;
    const completionRate = completedCount / milestones.length;
    if (completionRate >= 0.7) {
      score += 5;
      positiveSignals.push(`High milestone execution rate: ${Math.round(completionRate * 100)}%`);
    } else if (completionRate < 0.3) {
      score -= 10;
      riskFactors.push(`Low milestone execution rate: ${Math.round(completionRate * 100)}%`);
    }
  }

  // Factor 4: Founder Reporting Frequency
  if (latestUpdate) {
    const updateAgeDays = (Date.now() - new Date(latestUpdate.createdAt).getTime()) / (1000 * 3600 * 24);
    if (updateAgeDays <= 45) {
      score += 5;
      positiveSignals.push('Active and timely founder progress updates');
    } else if (updateAgeDays > 90) {
      score -= 15;
      riskFactors.push('Overdue founder progress update (>90 days old)');
    }
  } else {
    score -= 10;
    riskFactors.push('No founder progress updates submitted yet');
  }

  // Clamp score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  // Categorize Health Status
  let healthStatus = 'Healthy';
  if (finalScore >= 90) healthStatus = 'Excellent';
  else if (finalScore >= 75) healthStatus = 'Healthy';
  else if (finalScore >= 55) healthStatus = 'Watch';
  else if (finalScore >= 35) healthStatus = 'At Risk';
  else healthStatus = 'Critical';

  return {
    score: finalScore,
    healthStatus,
    riskFactors,
    positiveSignals,
  };
};

module.exports = {
  calculatePortfolioHealth,
};
