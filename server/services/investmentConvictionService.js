/**
 * Weighted 0-100 Conviction Score Engine
 */
const calculateConvictionScore = (startup = {}, evaluation = {}, diligence = {}) => {
  let score = 50;
  const strengths = [];
  const risks = [];

  // Factor 1: Evaluation overall score (20%)
  const evalScore = evaluation.overallScore || 75;
  if (evalScore >= 80) {
    score += 15;
    strengths.push(`High evaluation score (${evalScore}/100)`);
  } else if (evalScore < 60) {
    score -= 15;
    risks.push(`Low evaluation score (${evalScore}/100)`);
  }

  // Factor 2: Financial traction (15%)
  const arr = startup.financials?.arr || startup.arr || 0;
  if (arr >= 1000000) {
    score += 15;
    strengths.push(`Proven ARR traction ($${(arr / 1000000).toFixed(1)}M+)`);
  } else if (arr >= 250000) {
    score += 5;
  }

  // Factor 3: Due diligence progress (10%)
  const diligenceProgress = diligence.completionRate || 0.8;
  if (diligenceProgress >= 0.8) {
    score += 10;
    strengths.push(`Comprehensive due diligence completed (${Math.round(diligenceProgress * 100)}%)`);
  } else {
    risks.push('Due diligence incomplete');
  }

  // Normalize final score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  let confidenceLevel = 'Moderate';
  if (finalScore >= 85) confidenceLevel = 'Very High';
  else if (finalScore >= 75) confidenceLevel = 'High';
  else if (finalScore >= 55) confidenceLevel = 'Moderate';
  else if (finalScore >= 40) confidenceLevel = 'Low';
  else confidenceLevel = 'Very Low';

  return {
    score: finalScore,
    confidenceLevel,
    strengths,
    risks,
  };
};

module.exports = {
  calculateConvictionScore,
};
