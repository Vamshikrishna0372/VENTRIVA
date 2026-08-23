const ActivityLog = require('../models/ActivityLog');
const Startup = require('../models/Startup');
const BoardMember = require('../models/BoardMember');
const BoardMeeting = require('../models/BoardMeeting');
const BoardResolution = require('../models/BoardResolution');
const Shareholder = require('../models/Shareholder');
const ComplianceItem = require('../models/ComplianceItem');
const complianceService = require('../services/complianceService');

exports.getGovernanceActivity = async (req, res, next) => {
  try {
    const { startupId } = req.query;
    const filter = { activityType: 'governance' };

    if (startupId) filter.startup = startupId;
    if (req.user.role === 'founder') {
      const startup = await Startup.findOne({ founder: req.user._id });
      if (startup) filter.startup = startup._id;
    }

    const activities = await ActivityLog.find(filter)
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    next(error);
  }
};

exports.getAdminGovernanceAnalytics = async (req, res, next) => {
  try {
    const [totalBoards, totalMeetings, pendingResolutions, totalShareholders, complianceAggregate] = await Promise.all([
      BoardMember.distinct('startup').then((arr) => arr.length),
      BoardMeeting.countDocuments({ status: 'Scheduled' }),
      BoardResolution.countDocuments({ status: { $in: ['Voting', 'Proposed'] } }),
      Shareholder.countDocuments({ status: 'Active' }),
      ComplianceItem.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBoards,
        upcomingMeetings: totalMeetings,
        pendingResolutions,
        totalShareholders,
        complianceStatusBreakdown: complianceAggregate,
      },
    });
  } catch (error) {
    next(error);
  }
};
