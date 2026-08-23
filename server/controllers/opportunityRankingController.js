const { rankOpportunitiesForInvestor } = require('../services/opportunityRankingService');

/**
 * @desc    Get risk-adjusted opportunity ranking for published startups
 * @route   GET /api/opportunities/ranking
 * @access  Private (Investor only)
 */
const getOpportunityRanking = async (req, res, next) => {
  try {
    const rankedList = await rankOpportunitiesForInvestor(req.user._id);

    res.status(200).json({
      success: true,
      count: rankedList.length,
      data: rankedList,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOpportunityRanking,
};
