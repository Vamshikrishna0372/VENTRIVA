const User = require('../models/User');
const Startup = require('../models/Startup');

const recommendationService = {
  /**
   * Calculate transparent Platform Match Score (0 - 100%) between investor mandate & startup traits
   */
  calculateMatchScore(investor, startup) {
    let score = 0;
    const matchingFactors = [];
    const mismatchingFactors = [];

    const preferredSectors = Array.isArray(investor.preferredSectors) ? investor.preferredSectors : [];
    const preferredStages = Array.isArray(investor.preferredStages) ? investor.preferredStages : [];
    const preferredBusinessModels = Array.isArray(investor.preferredBusinessModels) ? investor.preferredBusinessModels : [];
    const preferredGeographies = Array.isArray(investor.preferredGeographies) ? investor.preferredGeographies : [];

    // 1. Sector Match (25%)
    if (preferredSectors.length === 0 || preferredSectors.includes(startup.sector)) {
      score += 25;
      matchingFactors.push(`Sector Match (${startup.sector})`);
    } else {
      mismatchingFactors.push(`Sector: Startup is ${startup.sector}`);
    }

    // 2. Stage Match (20%)
    if (preferredStages.length === 0 || preferredStages.includes(startup.stage)) {
      score += 20;
      matchingFactors.push(`Stage Match (${startup.stage})`);
    } else {
      mismatchingFactors.push(`Stage: Startup is ${startup.stage}`);
    }

    // 3. Business Model Match (15%)
    if (preferredBusinessModels.length === 0 || preferredBusinessModels.includes(startup.businessModel)) {
      score += 15;
      matchingFactors.push(`Business Model Match (${startup.businessModel})`);
    } else {
      mismatchingFactors.push(`Model: Startup is ${startup.businessModel}`);
    }

    // 4. Geography Match (10%)
    if (preferredGeographies.length === 0 || (startup.locationDisplay && preferredGeographies.some((g) => startup.locationDisplay.toLowerCase().includes(g.toLowerCase())))) {
      score += 10;
      matchingFactors.push(`Geography Match (${startup.locationDisplay || 'Global'})`);
    } else {
      mismatchingFactors.push(`Location: ${startup.locationDisplay || 'Unspecified'}`);
    }

    // 5. Investment Range Match (15%)
    const minInv = investor.minimumInvestment || 0;
    const maxInv = investor.maximumInvestment || 100000000;
    const required = startup.fundingRequired || 0;

    if (required >= minInv && required <= maxInv) {
      score += 15;
      matchingFactors.push(`Funding Range Match ($${required.toLocaleString()})`);
    } else {
      mismatchingFactors.push(`Funding: Requires $${required.toLocaleString()}`);
    }

    // 6. Fundraising Status (5%)
    if (startup.fundraisingStatus === 'Raising' || startup.fundraisingStatus === 'Actively Raising') {
      score += 5;
      matchingFactors.push('Actively Raising Capital');
    }

    // 7. Profile Completeness (5%)
    const profilePoints = Math.round(((startup.profileCompletion || 50) / 100) * 5);
    score += profilePoints;

    // 8. Traction Signal (5%)
    if (startup.monthlyRevenue > 0 || startup.revenueGrowth > 0) {
      score += 5;
      matchingFactors.push('Traction & Revenue Growth Signal');
    }

    const finalScore = Math.min(100, Math.max(0, Math.round(score)));

    return {
      matchScore: finalScore,
      matchingFactors,
      mismatchingFactors,
    };
  },

  /**
   * Get personalized startup recommendations for investor
   */
  async getInvestorRecommendations(investorId, filters = {}) {
    const investor = await User.findById(investorId).lean();
    if (!investor) throw new Error('Investor not found');

    const query = { isPublished: true, isDeleted: false, profileVisibility: 'Investors Only' };

    if (filters.sector && filters.sector !== 'all') query.sector = filters.sector;
    if (filters.stage && filters.stage !== 'all') query.stage = filters.stage;
    if (filters.businessModel && filters.businessModel !== 'all') query.businessModel = filters.businessModel;

    const startups = await Startup.find(query).lean();

    const ranked = startups.map((startup) => {
      const matchResult = this.calculateMatchScore(investor, startup);
      return {
        ...startup,
        matchScore: matchResult.matchScore,
        matchingFactors: matchResult.matchingFactors,
        mismatchingFactors: matchResult.mismatchingFactors,
      };
    });

    // Filter by min match score if specified
    const minScore = filters.minMatchScore ? Number(filters.minMatchScore) : 0;
    const filtered = ranked.filter((s) => s.matchScore >= minScore);

    // Sort descending by Platform Match Score
    filtered.sort((a, b) => b.matchScore - a.matchScore);

    return filtered;
  },
};

module.exports = recommendationService;
