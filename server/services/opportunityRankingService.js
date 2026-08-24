const Startup = require('../models/Startup');
const Evaluation = require('../models/Evaluation');
const InvestorStrategy = require('../models/InvestorStrategy');
const User = require('../models/User');
const { calculateConvictionScore } = require('./investmentConvictionService');
const { calculatePortfolioFit } = require('./portfolioFitService');

/**
 * Risk-Adjusted Opportunity Ranking Engine for Investor-Accessible Startups
 */
const rankOpportunitiesForInvestor = async (investorId, options = {}) => {
  // Query published non-deleted startups
  const query = { isPublished: true, isDeleted: false, profileVisibility: { $ne: 'Private' } };

  if (options.sector && options.sector !== 'all') {
    query.sector = options.sector;
  }
  if (options.stage && options.stage !== 'all') {
    query.stage = options.stage;
  }
  if (options.search && options.search.trim()) {
    const searchRegex = new RegExp(options.search.trim(), 'i');
    query.$or = [{ startupName: searchRegex }, { tagline: searchRegex }, { sector: searchRegex }];
  }

  const activeFounders = await User.find({ role: 'founder', isActive: { $ne: false } }).select('_id').lean();
  const activeFounderIds = activeFounders.map((u) => u._id);
  query.founder = { $in: activeFounderIds };

  const startups = await Startup.find(query)
    .populate('founder', 'name email avatar organization')
    .sort({ createdAt: -1 })
    .lean();

  // Load investor strategy & user mandate
  let strategy = await InvestorStrategy.findOne({ investor: investorId, active: true }).lean();
  const investorUser = await User.findById(investorId).lean();

  if (investorUser) {
    if (!strategy) strategy = {};
    strategy.preferredSectors = investorUser.preferredSectors || [];
    strategy.preferredStages = investorUser.preferredStages || [];
    strategy.minimumInvestment = investorUser.minimumInvestment || 0;
    strategy.maximumInvestment = investorUser.maximumInvestment || 0;
  }

  const rankedList = [];

  for (const startup of startups) {
    const evaluation = (await Evaluation.findOne({ startup: startup._id, investor: investorId }).lean()) || {};
    const conviction = calculateConvictionScore(startup, evaluation, {});
    const fit = calculatePortfolioFit(startup, strategy);

    const overallScore = Math.min(100, Math.max(0, Math.round((conviction.score + fit.portfolioFitScore) / 2)));

    let recommendedAction = 'Monitor';
    if (overallScore >= 85) recommendedAction = 'Invest Now';
    else if (overallScore >= 75) recommendedAction = 'Deep Review';
    else if (overallScore >= 60) recommendedAction = 'Continue Due Diligence';

    const checkSize = (strategy && strategy.targetInitialCheckSize) || (investorUser && investorUser.minimumInvestment) || 250000;

    const matchedText = fit.matchedCriteria?.length > 0 ? fit.matchedCriteria.join(', ') : 'Base thesis alignment';

    rankedList.push({
      startup,
      overallOpportunityScore: overallScore,
      convictionScore: conviction.score,
      portfolioFitScore: fit.portfolioFitScore,
      riskScore: Math.max(0, 100 - overallScore),
      recommendedAction,
      recommendedCheckSize: checkSize,
      explanation: `Conviction ${conviction.score}/100, Fit ${fit.portfolioFitScore}/100. ${matchedText}.`,
    });
  }

  // Sort by overall opportunity score descending
  rankedList.sort((a, b) => b.overallOpportunityScore - a.overallOpportunityScore);

  return rankedList.map((item, idx) => ({ ...item, rank: idx + 1 }));
};

module.exports = {
  rankOpportunitiesForInvestor,
};

