const GovernanceRight = require('../models/GovernanceRight');
const Startup = require('../models/Startup');

exports.getGovernanceRights = async (req, res, next) => {
  try {
    const { startupId } = req.query;
    const filter = {};

    if (startupId) filter.startup = startupId;
    if (req.user.role === 'investor') {
      filter.holder = req.user._id;
    } else if (req.user.role === 'founder') {
      const startup = await Startup.findOne({ founder: req.user._id });
      if (startup) filter.startup = startup._id;
    }

    const rights = await GovernanceRight.find(filter)
      .populate('holder', 'name email companyName')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, count: rights.length, data: rights });
  } catch (error) {
    next(error);
  }
};
