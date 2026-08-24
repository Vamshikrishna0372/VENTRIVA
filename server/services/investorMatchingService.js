const User = require('../models/User');
const Startup = require('../models/Startup');

/**
 * Investor ↔ Startup Matching Engine
 * Weighted 5-vector transparent match model (0 - 100%)
 */
const calculateInvestorStartupMatch = (investor, startup) => {
  let score = 0;
  const matchedCriteria = [];
  const unmatchedCriteria = [];

  const preferredSectors = Array.isArray(investor.preferredSectors) ? investor.preferredSectors : [];
  const preferredStages = Array.isArray(investor.preferredStages) ? investor.preferredStages : [];
  const preferredBusinessModels = Array.isArray(investor.preferredBusinessModels) ? investor.preferredBusinessModels : [];
  const preferredGeographies = Array.isArray(investor.preferredGeographies) ? investor.preferredGeographies : [];

  // 1. Sector Match (30%)
  if (preferredSectors.length === 0 || preferredSectors.some((s) => s.toLowerCase() === (startup.sector || '').toLowerCase())) {
    score += 30;
    matchedCriteria.push(`✓ Sector Match (${startup.sector || 'All Sectors'})`);
  } else {
    unmatchedCriteria.push(`Sector Mismatch: Startup is ${startup.sector}`);
  }

  // 2. Stage Match (20%)
  if (preferredStages.length === 0 || preferredStages.some((s) => s.toLowerCase() === (startup.stage || '').toLowerCase())) {
    score += 20;
    matchedCriteria.push(`✓ Stage Match (${startup.stage || 'All Stages'})`);
  } else {
    unmatchedCriteria.push(`Stage Mismatch: Startup is ${startup.stage}`);
  }

  // 3. Ticket Size / Investment Range Match (20%)
  const minInv = investor.minimumInvestment || 0;
  const maxInv = investor.maximumInvestment || 100000000;
  const required = startup.fundingRequired || 0;

  if (required === 0 || (required >= minInv && required <= maxInv)) {
    score += 20;
    matchedCriteria.push(`✓ Ticket Size Match ($${required.toLocaleString()})`);
  } else {
    unmatchedCriteria.push(`Ticket Size Mismatch: Target $${required.toLocaleString()}`);
  }

  // 4. Geography Match (15%)
  if (
    preferredGeographies.length === 0 ||
    preferredGeographies.some((g) => (startup.locationDisplay || startup.country || '').toLowerCase().includes(g.toLowerCase()))
  ) {
    score += 15;
    matchedCriteria.push(`✓ Geography Match (${startup.locationDisplay || startup.country || 'Global'})`);
  } else {
    unmatchedCriteria.push(`Geography Mismatch: Location ${startup.locationDisplay || startup.country}`);
  }

  // 5. Business Model Match (15%)
  if (
    preferredBusinessModels.length === 0 ||
    preferredBusinessModels.some((b) => b.toLowerCase() === (startup.businessModel || '').toLowerCase())
  ) {
    score += 15;
    matchedCriteria.push(`✓ Business Model Match (${startup.businessModel || 'All Models'})`);
  } else {
    unmatchedCriteria.push(`Business Model Mismatch: ${startup.businessModel}`);
  }

  const matchScore = Math.min(100, Math.max(0, Math.round(score)));

  let recommendationReason = 'High investment mandate affinity across sector and stage.';
  if (matchScore >= 90) recommendationReason = 'Exceptional alignment with your VC investment thesis and ticket size range.';
  else if (matchScore >= 70) recommendationReason = 'Strong sector and stage fit aligned with your fund preferences.';
  else if (matchScore >= 50) recommendationReason = 'Moderate mandate fit with partial sector or stage alignment.';

  return {
    matchScore,
    matchedCriteria,
    unmatchedCriteria,
    recommendationReason,
  };
};

const InvestorStrategy = require('../models/InvestorStrategy');

/**
 * Fetch top matching published startups for authenticated investor
 */
const getMatchingStartupsForInvestor = async (investorId, options = {}) => {
  const investor = await User.findById(investorId).lean();
  if (!investor) throw new Error('Investor user document not found.');

  // Fetch active InvestorStrategy to ensure preference synchronization
  const strategy = await InvestorStrategy.findOne({ investor: investorId, active: true }).lean();
  if (strategy) {
    if ((!investor.preferredSectors || investor.preferredSectors.length === 0) && Array.isArray(strategy.targetSectorAllocations)) {
      investor.preferredSectors = strategy.targetSectorAllocations.map((s) => s.sector);
    }
    if ((!investor.preferredStages || investor.preferredStages.length === 0) && Array.isArray(strategy.targetStageAllocations)) {
      investor.preferredStages = strategy.targetStageAllocations.map((s) => s.stage);
    }
    if (!investor.minimumInvestment && strategy.targetInitialCheckSize) {
      investor.minimumInvestment = Math.round(strategy.targetInitialCheckSize * 0.5);
      investor.maximumInvestment = Math.round(strategy.targetInitialCheckSize * 2.0);
    }
  }

  const activeFounders = await User.find({ role: 'founder', isActive: { $ne: false } }).select('_id').lean();
  const activeFounderIds = activeFounders.map((u) => u._id);

  // Security & Data Visibility Filter: Only published, non-deleted startups with active founders
  const query = { isPublished: true, isDeleted: false, founder: { $in: activeFounderIds } };

  const startups = await Startup.find(query)
    .populate('founder', 'name email avatar organization')
    .lean();

  const ranked = startups.map((startup) => {
    const match = calculateInvestorStartupMatch(investor, startup);
    return {
      startup,
      matchScore: match.matchScore,
      matchedCriteria: match.matchedCriteria,
      unmatchedCriteria: match.unmatchedCriteria,
      recommendationReason: match.recommendationReason,
    };
  });

  // Sort descending by matchScore
  ranked.sort((a, b) => b.matchScore - a.matchScore);

  const limit = options.limit ? parseInt(options.limit, 10) : 10;
  return ranked.slice(0, limit);
};

module.exports = {
  calculateInvestorStartupMatch,
  getMatchingStartupsForInvestor,
};
