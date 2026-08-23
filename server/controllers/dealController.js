const Deal = require('../models/Deal');
const Startup = require('../models/Startup');
const PipelineEntry = require('../models/PipelineEntry');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const { DEAL_STATUSES } = require('../config/dealConstants');

/**
 * @desc    Create a new Deal Room from a pipeline opportunity
 * @route   POST /api/deals
 * @access  Private (Investor only)
 */
const createDealFromPipeline = async (req, res, next) => {
  try {
    const { startupId, pipelineEntryId, targetInvestment, valuation, dealType, termsSummary, closingDate } = req.body;

    const startup = await Startup.findById(startupId);
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    if (!startup.founder) {
      return res.status(400).json({ success: false, message: 'Startup has no valid founder assigned' });
    }

    // Check if deal room already exists
    let deal = await Deal.findOne({ startup: startupId, investor: req.user._id });
    if (deal) {
      return res.status(200).json({
        success: true,
        message: 'Existing Deal Room retrieved',
        data: deal,
      });
    }

    deal = await Deal.create({
      startup: startupId,
      investor: req.user._id,
      founder: startup.founder,
      pipelineEntry: pipelineEntryId || null,
      targetInvestment: targetInvestment || 0,
      valuation: valuation || 0,
      dealType: dealType || 'Priced Equity Round',
      termsSummary: termsSummary || '',
      closingDate: closingDate || null,
      status: 'Active',
    });

    // Create Initial Audit Activity
    await ActivityLog.create({
      activityType: 'deal',
      deal: deal._id,
      startup: startupId,
      actor: req.user._id,
      action: 'DEAL_ROOM_CREATED',
      description: `Deal room initialized for ${startup.startupName}`,
      metadata: { newStatus: 'Active' },
    });

    // Generate Notification for Founder
    await Notification.create({
      user: startup.founder,
      recipient: startup.founder,
      sender: req.user._id,
      type: 'DEAL_UPDATE',
      title: 'New Investment Deal Room Opened',
      message: `An investor has initialized an active Investment Deal Room for ${startup.startupName}.`,
      link: `/founder/deals/${deal._id}`,
      relatedEntity: {
        entityType: 'Startup',
        entityId: startup._id,
      },
    });

    // If pipeline entry exists, update pipeline stage to Due Diligence
    if (pipelineEntryId) {
      await PipelineEntry.findByIdAndUpdate(pipelineEntryId, { stage: 'Due Diligence' });
    }

    res.status(201).json({
      success: true,
      message: 'Deal Room created successfully',
      data: deal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's deal rooms (Founder or Investor)
 * @route   GET /api/deals
 * @access  Private
 */
const getMyDeals = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'founder') {
      query = { founder: req.user._id };
    } else if (req.user.role === 'investor') {
      query = { investor: req.user._id };
    } else if (req.user.role === 'admin') {
      query = {}; // Admin overview
    }

    const deals = await Deal.find(query)
      .populate('startup', 'startupName tagline logo sector stage fundingAsk profileVisibility')
      .populate('investor', 'name email organization avatar')
      .populate('founder', 'name email bio location avatar')
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: deals.length,
      data: deals,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get deal room details by ID
 * @route   GET /api/deals/:id
 * @access  Private (Participants + Admin)
 */
const getDealById = async (req, res, next) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('startup')
      .populate('investor', 'name email organization avatar')
      .populate('founder', 'name email bio location avatar');

    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal Room not found' });
    }

    // RBAC Isolation
    const isFounder = deal.founder._id.toString() === req.user._id.toString();
    const isInvestor = deal.investor._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFounder && !isInvestor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this Deal Room' });
    }

    res.status(200).json({
      success: true,
      data: deal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Deal Room status
 * @route   PATCH /api/deals/:id/status
 * @access  Private (Participants)
 */
const updateDealStatus = async (req, res, next) => {
  try {
    const { status, termsSummary } = req.body;
    if (!DEAL_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid deal status' });
    }

    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal Room not found' });
    }

    const isFounder = deal.founder.toString() === req.user._id.toString();
    const isInvestor = deal.investor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFounder && !isInvestor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this Deal Room' });
    }

    const prevStatus = deal.status;
    deal.status = status;
    if (termsSummary !== undefined) deal.termsSummary = termsSummary;
    await deal.save();

    // Log Activity
    await ActivityLog.create({
      activityType: 'deal',
      deal: deal._id,
      startup: deal.startup,
      actor: req.user._id,
      action: 'STATUS_CHANGED',
      description: `Deal status updated from ${prevStatus} to ${status}`,
      metadata: { previousStatus: prevStatus, newStatus: status },
    });

    // Notify counterpart
    const recipientId = isInvestor ? deal.founder : deal.investor;
    await Notification.create({
      recipient: recipientId,
      sender: req.user._id,
      type: 'DEAL_UPDATE',
      title: 'Deal Room Status Updated',
      message: `Deal status changed to "${status}".`,
      link: isInvestor ? `/founder/deals/${deal._id}` : `/investor/deals/${deal._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Deal Room status updated successfully',
      data: deal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Archive Deal Room
 * @route   PATCH /api/deals/:id/archive
 * @access  Private (Participants)
 */
const archiveDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal Room not found' });
    }

    const isFounder = deal.founder.toString() === req.user._id.toString();
    const isInvestor = deal.investor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFounder && !isInvestor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to archive this Deal Room' });
    }

    deal.isArchived = true;
    deal.status = 'Withdrawn';
    await deal.save();

    await ActivityLog.create({
      activityType: 'deal',
      deal: deal._id,
      startup: deal.startup,
      actor: req.user._id,
      action: 'DEAL_ARCHIVED',
      description: 'Deal Room archived and closed',
      metadata: { newStatus: 'Withdrawn' },
    });

    res.status(200).json({
      success: true,
      message: 'Deal Room archived successfully',
      data: deal,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDealFromPipeline,
  getMyDeals,
  getDealById,
  updateDealStatus,
  archiveDeal,
};
