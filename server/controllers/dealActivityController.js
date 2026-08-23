const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Get deal activities audit timeline for a Deal Room
 * @route   GET /api/deals/:dealId/activities
 * @access  Private (Participants + Admin)
 */
const getDealActivities = async (req, res, next) => {
  try {
    const { dealId } = req.params;
    const activities = await ActivityLog.find({ activityType: 'deal', deal: dealId })
      .populate('actor', 'name email role avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDealActivities,
};
