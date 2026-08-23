const CorporateAction = require('../models/CorporateAction');
const Startup = require('../models/Startup');
const governanceService = require('../services/governanceService');

exports.getCorporateActions = async (req, res, next) => {
  try {
    const { startupId } = req.query;
    const filter = {};

    if (startupId) filter.startup = startupId;
    if (req.user.role === 'founder') {
      const startup = await Startup.findOne({ founder: req.user._id });
      if (startup) filter.startup = startup._id;
    }

    const actions = await CorporateAction.find(filter)
      .populate('proposedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, count: actions.length, data: actions });
  } catch (error) {
    next(error);
  }
};

exports.proposeCorporateAction = async (req, res, next) => {
  try {
    const { startupId, actionType, title, description, shareImpact, valuationImpact } = req.body;
    const startup = await Startup.findById(startupId);
    if (!startup) return res.status(404).json({ success: false, message: 'Startup not found' });

    if (req.user.role !== 'admin' && startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to propose corporate actions' });
    }

    const action = await CorporateAction.create({
      startup: startup._id,
      actionType,
      title,
      description,
      shareImpact: Number(shareImpact) || 0,
      valuationImpact: Number(valuationImpact) || 0,
      proposedBy: req.user._id,
      status: 'Proposed',
    });

    await governanceService.recordActivity({
      startupId: startup._id,
      actorId: req.user._id,
      eventType: 'CORPORATE_ACTION_EXECUTED',
      entityType: 'CorporateAction',
      entityId: action._id,
      description: `Proposed Corporate Action: '${action.title}' (${action.actionType})`,
    });

    res.status(201).json({ success: true, data: action });
  } catch (error) {
    next(error);
  }
};
