const mongoose = require('mongoose');
const Startup = require('../models/Startup');
const TeamMember = require('../models/TeamMember');
const Evaluation = require('../models/Evaluation');
const Shortlist = require('../models/Shortlist');

/**
 * @desc    Compare up to 3 shortlisted startups side-by-side
 * @route   GET /api/evaluations/compare
 * @access  Private (Investor)
 */
const compareStartups = async (req, res, next) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({ success: false, message: 'Please provide startup IDs for comparison (max 3)' });
    }

    let startupIds = [];
    if (Array.isArray(ids)) {
      startupIds = ids;
    } else if (typeof ids === 'string') {
      startupIds = ids.split(',').map((id) => id.trim());
    }

    startupIds = startupIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (startupIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid startup IDs provided for comparison' });
    }

    if (startupIds.length > 3) {
      return res.status(400).json({ success: false, message: 'You can compare a maximum of 3 startups at a time' });
    }

    // Verify all requested startups are shortlisted by current investor
    const shortlists = await Shortlist.find({ investor: req.user._id, startup: { $in: startupIds } });
    const shortlistedStartupIds = new Set(shortlists.map((s) => s.startup.toString()));

    const validIds = startupIds.filter((id) => shortlistedStartupIds.has(id));

    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'None of the requested startups are in your shortlist or available for comparison',
      });
    }

    // Fetch startups matching eligibility
    const startups = await Startup.find({
      _id: { $in: validIds },
      isDeleted: false,
      isPublished: true,
      profileVisibility: 'Investors Only',
    }).lean();

    // Fetch team members & private evaluations for each startup
    const comparisons = await Promise.all(
      startups.map(async (startup) => {
        const teamMembers = await TeamMember.find({ startup: startup._id }).lean();
        const evaluation = await Evaluation.findOne({ investor: req.user._id, startup: startup._id }).lean();

        return {
          startup,
          teamCount: teamMembers.length,
          evaluation: evaluation || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: comparisons.length,
      comparisons,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  compareStartups,
};
