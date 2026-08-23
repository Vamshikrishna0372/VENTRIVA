const Startup = require('../models/Startup');
const Evaluation = require('../models/Evaluation');
const { calculateConvictionScore } = require('./investmentConvictionService');
const { calculatePortfolioFit } = require('./portfolioFitService');

/**
 * Risk-Adjusted Opportunity Ranking Engine for Investor-Accessible Startups
 */
const rankOpportunitiesForInvestor = async (investorId, options = {}) => {
  // Query published startups
  const startups = await Startup.find({ profileVisibility: 'Published' })
    .populate('founder', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  const rankedList = [];

  for (const startup of startups) {
    const evaluation = (await Evaluation.findOne({ startup: startup._id, investor: investorId }).lean()) || {};
    const conviction = calculateConvictionScore(startup, evaluation, {});
    const fit = calculatePortfolioFit(startup, null);

    const overallScore = Math.round((conviction.score + fit.portfolioFitScore) / 2);

    let recommendedAction = 'Monitor';
    if (overallScore >= 85) recommendedAction = 'Invest Now';
    else if (overallScore >= 75) recommendedAction = 'Deep Review';
    else if (overallScore >= 60) recommendedAction = 'Continue Due Diligence';

    rankedList.push({
      startup,
      overallOpportunityScore: overallScore,
      convictionScore: conviction.score,
      portfolioFitScore: fit.portfolioFitScore,
      riskScore: Math.max(0, 100 - overallScore),
      recommendedAction,
      recommendedCheckSize: 250000,
      explanation: `Conviction ${conviction.score}/100, Fit ${fit.portfolioFitScore}/100.`,
    });
  }

  // Sort by overall opportunity score descending
  rankedList.sort((a, b) => b.overallOpportunityScore - a.overallOpportunityScore);

  return rankedList.map((item, idx) => ({ ...item, rank: idx + 1 }));
};

module.exports = {
  rankOpportunitiesForInvestor,
};
