const Startup = require('../models/Startup');
const { calculateInvestmentReadiness } = require('../services/startupReadinessService');

/**
 * @desc    Get database-driven Investment Readiness Score for authenticated founder's startup
 * @route   GET /api/startups/my/readiness
 * @access  Private (Founder)
 */
const getMyStartupReadiness = async (req, res, next) => {
  try {
    const startup = await Startup.findOne({ founder: req.user._id, isDeleted: false });
    if (!startup) {
      return res.status(200).json({
        success: true,
        data: {
          startupId: null,
          startupName: '',
          overallScore: 0,
          readinessLevel: 'Not Started',
          summary: 'No active startup profile found. Create your startup to generate your Investment Readiness Score.',
          categoryScores: {
            profile: { name: 'Company Profile', score: 0, maxScore: 20 },
            team: { name: 'Team Readiness', score: 0, maxScore: 20 },
            financials: { name: 'Financial Metrics', score: 0, maxScore: 20 },
            funding: { name: 'Fundraising Strategy', score: 0, maxScore: 20 },
            documents: { name: 'Data Room Compliance', score: 0, maxScore: 20 },
          },
          completedItems: [],
          missingItems: ['Create Startup Profile'],
          recommendedActions: [
            {
              title: 'Create Startup Profile',
              description: 'Complete your startup profile to calculate your institutional readiness score.',
              priority: 'High',
              category: 'Company Profile',
              targetRoute: '/founder/startup',
            },
          ],
        },
      });
    }

    const readiness = await calculateInvestmentReadiness(startup._id, req.user._id);

    // Update profileCompletion on startup if different
    if (startup.profileCompletion !== readiness.overallScore) {
      startup.profileCompletion = readiness.overallScore;
      await startup.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success: true,
      data: {
        startupId: startup._id,
        startupName: startup.startupName,
        ...readiness,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyStartupReadiness,
};
