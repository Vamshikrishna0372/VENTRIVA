const FundraisingRound = require('../models/FundraisingRound');
const Startup = require('../models/Startup');
const ActivityLog = require('../models/ActivityLog');
const Document = require('../models/Document');
const fundraisingAnalyticsService = require('../services/fundraisingAnalyticsService');
const fundraisingStatusService = require('../services/fundraisingStatusService');

/**
 * Create a new fundraising round
 */
exports.createRound = async (req, res, next) => {
  try {
    const {
      startupId,
      roundType,
      roundName,
      targetAmount,
      minimumAmount,
      maximumAmount,
      preMoneyValuation,
      postMoneyValuation,
      targetOwnershipPercentage,
      minimumTicketSize,
      maximumTicketSize,
      currency,
      openingDate,
      targetClosingDate,
      description,
      useOfFunds,
      leadInvestor,
      allowNewInvestors,
      allowExistingInvestors,
      isPublic,
    } = req.body;

    const startup = await Startup.findById(startupId || req.body.startup);
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    // Verify founder ownership
    if (req.user.role !== 'admin' && startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You are not the owner of this startup' });
    }

    // Check for existing active draft or open round
    const existingActiveRound = await FundraisingRound.findOne({
      startup: startup._id,
      status: { $in: ['Draft', 'Open', 'Soft Commitments', 'In Due Diligence', 'Term Sheet Stage', 'Closing'] },
      isArchived: false,
    });

    if (existingActiveRound) {
      return res.status(400).json({
        success: false,
        message: `An active fundraising round (${existingActiveRound.roundName} - ${existingActiveRound.status}) already exists for this startup`,
      });
    }

    const newRound = await FundraisingRound.create({
      startup: startup._id,
      founder: startup.founder,
      roundType,
      roundName,
      targetAmount: Number(targetAmount),
      minimumAmount: minimumAmount ? Number(minimumAmount) : 0,
      maximumAmount: maximumAmount ? Number(maximumAmount) : 0,
      preMoneyValuation: preMoneyValuation ? Number(preMoneyValuation) : 0,
      postMoneyValuation: postMoneyValuation ? Number(postMoneyValuation) : 0,
      targetOwnershipPercentage: targetOwnershipPercentage ? Number(targetOwnershipPercentage) : 0,
      minimumTicketSize: minimumTicketSize ? Number(minimumTicketSize) : 0,
      maximumTicketSize: maximumTicketSize ? Number(maximumTicketSize) : 0,
      currency: currency || 'USD',
      openingDate: openingDate ? new Date(openingDate) : null,
      targetClosingDate: targetClosingDate ? new Date(targetClosingDate) : null,
      description: description || '',
      useOfFunds: useOfFunds || '',
      leadInvestor: leadInvestor || '',
      allowNewInvestors: allowNewInvestors !== undefined ? allowNewInvestors : true,
      allowExistingInvestors: allowExistingInvestors !== undefined ? allowExistingInvestors : true,
      isPublic: isPublic !== undefined ? isPublic : true,
      createdBy: req.user._id,
    });

    // Audit log
    await fundraisingStatusService.recordActivity({
      fundraisingRound: newRound._id,
      startup: newRound.startup,
      founder: newRound.founder,
      actor: req.user._id,
      action: 'ROUND_CREATED',
      description: `Created fundraising round '${newRound.roundName}' with target ${newRound.targetAmount} ${newRound.currency}`,
      metadata: { targetAmount: newRound.targetAmount, roundType: newRound.roundType },
    });

    res.status(201).json({
      success: true,
      data: newRound,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List fundraising rounds based on role & permissions
 */
exports.getRounds = async (req, res, next) => {
  try {
    const { status, startupId, search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    let filter = { isArchived: false };

    if (req.user.role === 'founder') {
      filter.founder = req.user._id;
    } else if (req.user.role === 'investor') {
      // Investors see public rounds that are non-draft, or rounds where they are invited/participating
      filter.$or = [
        { isPublic: true, status: { $in: ['Open', 'Soft Commitments', 'In Due Diligence', 'Term Sheet Stage', 'Closing', 'Closed'] } },
      ];
    } // Admin sees all

    if (status) {
      filter.status = status;
    }
    if (startupId) {
      filter.startup = startupId;
    }
    if (search) {
      filter.roundName = { $regex: search, $options: 'i' };
    }

    const total = await FundraisingRound.countDocuments(filter);
    const rounds = await FundraisingRound.find(filter)
      .populate('startup', 'startupName logo tagline sector stage website')
      .populate('founder', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: rounds.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      data: rounds,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single fundraising round details
 */
exports.getRoundById = async (req, res, next) => {
  try {
    const round = await FundraisingRound.findById(req.params.id)
      .populate('startup', 'startupName logo tagline sector stage valuation ARR MRR location website')
      .populate('founder', 'name email avatar organization bio')
      .lean();

    if (!round) {
      return res.status(404).json({ success: false, message: 'Fundraising round not found' });
    }

    // Access Check
    if (req.user.role === 'founder' && round.founder._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied to this fundraising round' });
    }

    // Retrieve linked documents & milestones directly from embedded arrays
    const documentLinks = round.documentLinks || [];
    const milestones = round.milestones || [];

    // Retrieve analytics
    const analytics = await fundraisingAnalyticsService.getRoundAnalytics(round._id);

    // Retrieve activity timeline if owner or admin
    let activity = [];
    if (req.user.role === 'admin' || (req.user.role === 'founder' && round.founder._id.toString() === req.user._id.toString())) {
      activity = await ActivityLog.find({ activityType: 'fundraising', fundraisingRound: round._id })
        .populate('actor', 'name email avatar role')
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();
    }

    res.status(200).json({
      success: true,
      data: {
        ...round,
        documentLinks,
        milestones,
        analytics,
        activity,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update fundraising round configuration
 */
exports.updateRound = async (req, res, next) => {
  try {
    const round = await FundraisingRound.findById(req.params.id);
    if (!round) {
      return res.status(404).json({ success: false, message: 'Fundraising round not found' });
    }

    if (req.user.role !== 'admin' && round.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this round' });
    }

    if (['Closed', 'Cancelled'].includes(round.status)) {
      return res.status(400).json({ success: false, message: `Cannot modify a round in '${round.status}' state` });
    }

    const allowedUpdates = [
      'roundName',
      'roundType',
      'targetAmount',
      'minimumAmount',
      'maximumAmount',
      'preMoneyValuation',
      'postMoneyValuation',
      'targetOwnershipPercentage',
      'minimumTicketSize',
      'maximumTicketSize',
      'currency',
      'targetClosingDate',
      'description',
      'useOfFunds',
      'leadInvestor',
      'allowNewInvestors',
      'allowExistingInvestors',
      'isPublic',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        round[field] = req.body[field];
      }
    });

    round.updatedBy = req.user._id;
    await round.save();

    await fundraisingStatusService.recordActivity({
      fundraisingRound: round._id,
      startup: round.startup,
      founder: round.founder,
      actor: req.user._id,
      action: 'ROUND_UPDATED',
      description: `Updated fundraising round configuration for '${round.roundName}'`,
    });

    res.status(200).json({
      success: true,
      data: round,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Open draft round
 */
exports.openRound = async (req, res, next) => {
  try {
    const round = await fundraisingStatusService.transitionStatus(req.params.id, 'Open', req.user._id, req.body.reason);
    res.status(200).json({ success: true, data: round });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Close fundraising round
 */
exports.closeRound = async (req, res, next) => {
  try {
    const round = await fundraisingStatusService.transitionStatus(req.params.id, 'Closed', req.user._id, req.body.reason);
    res.status(200).json({ success: true, data: round });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Cancel fundraising round
 */
exports.cancelRound = async (req, res, next) => {
  try {
    const round = await fundraisingStatusService.transitionStatus(req.params.id, 'Cancelled', req.user._id, req.body.reason);
    res.status(200).json({ success: true, data: round });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Get Round Analytics
 */
exports.getRoundAnalytics = async (req, res, next) => {
  try {
    const round = await FundraisingRound.findById(req.params.id).lean();
    if (!round) {
      return res.status(404).json({ success: false, message: 'Fundraising round not found' });
    }

    if (req.user.role === 'founder' && round.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const analytics = await fundraisingAnalyticsService.getRoundAnalytics(round._id);
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    next(error);
  }
};

/**
 * Document Links Controller helpers
 */
exports.linkDocument = async (req, res, next) => {
  try {
    const { documentId, documentType, category, description } = req.body;
    const round = await FundraisingRound.findById(req.params.id);
    if (!round) return res.status(404).json({ success: false, message: 'Round not found' });

    if (req.user.role !== 'admin' && round.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ success: false, message: 'Data room document not found' });

    const link = {
      document: doc._id,
      linkedBy: req.user._id,
      createdAt: new Date(),
    };

    round.documentLinks = round.documentLinks || [];
    round.documentLinks.push(link);
    await round.save();

    res.status(201).json({ success: true, data: link });
  } catch (error) {
    next(error);
  }
};

/**
 * Milestones Controller helpers
 */
exports.addMilestone = async (req, res, next) => {
  try {
    const { title, targetAmount, dueDate } = req.body;
    const round = await FundraisingRound.findById(req.params.id);
    if (!round) return res.status(404).json({ success: false, message: 'Round not found' });

    if (req.user.role !== 'admin' && round.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const milestone = {
      title,
      targetAmount: targetAmount ? Number(targetAmount) : 0,
      targetDate: dueDate ? new Date(dueDate) : null,
      status: 'Pending',
      createdAt: new Date(),
    };

    round.milestones = round.milestones || [];
    round.milestones.push(milestone);
    await round.save();

    res.status(201).json({ success: true, data: milestone });
  } catch (error) {
    next(error);
  }
};

/**
 * Notes Controller (Owner-Isolated)
 */
exports.addNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    const round = await FundraisingRound.findById(req.params.id);
    if (!round) return res.status(404).json({ success: false, message: 'Round not found' });

    const newNote = {
      author: req.user._id,
      noteText: note,
      createdAt: new Date(),
    };

    round.notes = round.notes || [];
    round.notes.push(newNote);
    await round.save();

    res.status(201).json({ success: true, data: newNote });
  } catch (error) {
    next(error);
  }
};

exports.getNotes = async (req, res, next) => {
  try {
    const round = await FundraisingRound.findById(req.params.id).lean();
    if (!round) return res.status(404).json({ success: false, message: 'Round not found' });

    const notes = (round.notes || []).filter((n) => n.author.toString() === req.user._id.toString());

    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    next(error);
  }
};
