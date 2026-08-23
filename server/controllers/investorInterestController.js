const mongoose = require('mongoose');
const InvestorInterest = require('../models/InvestorInterest');
const Startup = require('../models/Startup');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

/**
 * @desc    Express investor interest in a startup
 * @route   POST /api/interests
 * @access  Private (Investor)
 */
const expressInterest = async (req, res, next) => {
  try {
    const { startupId, message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(startupId)) {
      return res.status(400).json({ success: false, message: 'Invalid Startup ObjectId format' });
    }

    if (req.user.role !== 'investor') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only verified investors can express interest' });
    }

    const startup = await Startup.findById(startupId);
    if (!startup || startup.isDeleted) {
      return res.status(404).json({ success: false, message: 'Startup profile unavailable for investor interest' });
    }

    // Ownership Gate: Founder cannot express interest in own startup
    if (startup.founder.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Founders cannot express investor interest in their own startup' });
    }

    // Duplicate Interest check
    const existing = await InvestorInterest.findOne({ investor: req.user._id, startup: startup._id });
    if (existing && existing.status !== 'Withdrawn') {
      return res.status(400).json({ success: false, message: `Interest already submitted with status: ${existing.status}` });
    }

    let interest;
    if (existing) {
      existing.status = 'Interested';
      existing.message = message ? message.trim() : '';
      existing.respondedAt = null;
      interest = await existing.save();
    } else {
      interest = await InvestorInterest.create({
        investor: req.user._id,
        startup: startup._id,
        founder: startup.founder,
        status: 'Interested',
        message: message ? message.trim() : '',
      });
    }

    // Create Notification alert for founder
    await Notification.create({
      user: startup.founder,
      type: 'InvestorInterest',
      title: `New Investor Interest: ${req.user.name}`,
      message: `${req.user.name} expressed interest in ${startup.startupName}.`,
      relatedEntityType: 'InvestorInterest',
      relatedEntityId: interest._id,
    });

    res.status(201).json({
      success: true,
      message: 'Investor interest submitted successfully',
      interest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current investor's submitted interests
 * @route   GET /api/interests/my
 * @access  Private (Investor)
 */
const getMyInterests = async (req, res, next) => {
  try {
    const interests = await InvestorInterest.find({ investor: req.user._id })
      .populate('startup', 'startupName sector stage logo tagline')
      .populate('founder', 'name email organization')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: interests.length,
      interests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get received investor interests for founder's startup
 * @route   GET /api/interests/startup/:startupId
 * @access  Private (Founder Owner / Admin)
 */
const getStartupInterests = async (req, res, next) => {
  try {
    const { startupId } = req.params;

    const startup = await Startup.findById(startupId);
    if (!startup || startup.isDeleted) {
      return res.status(404).json({ success: false, message: 'Startup profile not found' });
    }

    if (req.user.role !== 'admin' && startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this startup' });
    }

    const interests = await InvestorInterest.find({ startup: startup._id })
      .populate('investor', 'name email organization avatar profileSummary')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: interests.length,
      interests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Founder responds to investor interest (Accept / Decline)
 * @route   PATCH /api/interests/:id/respond
 * @access  Private (Founder Owner)
 */
const respondToInterest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Accepted' | 'Declined'

    if (!['Accepted', 'Declined'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Accepted or Declined' });
    }

    const interest = await InvestorInterest.findById(id);
    if (!interest) {
      return res.status(404).json({ success: false, message: 'Investor interest record not found' });
    }

    const startup = await Startup.findById(interest.startup);
    if (req.user.role !== 'admin' && startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this startup' });
    }

    interest.status = status;
    interest.respondedAt = new Date();
    await interest.save();

    let conversation = null;
    if (status === 'Accepted') {
      // Create or activate Conversation thread
      conversation = await Conversation.findOne({ startup: startup._id, investor: interest.investor });
      if (!conversation) {
        conversation = await Conversation.create({
          startup: startup._id,
          founder: startup.founder,
          investor: interest.investor,
          initiatedBy: req.user._id,
          subject: `${startup.startupName} — Investment Engagement`,
          status: 'Active',
        });
      } else if (conversation.status !== 'Active') {
        conversation.status = 'Active';
        await conversation.save();
      }
    }

    // Create Notification alert for investor
    await Notification.create({
      user: interest.investor,
      type: 'InterestResponse',
      title: `Interest ${status}: ${startup.startupName}`,
      message: `${startup.startupName} founder ${status.toLowerCase()} your express interest request.`,
      relatedEntityType: 'Conversation',
      relatedEntityId: conversation ? conversation._id : null,
    });

    res.status(200).json({
      success: true,
      message: `Investor interest ${status.toLowerCase()} successfully`,
      interest,
      conversationId: conversation ? conversation._id : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Withdraw submitted investor interest
 * @route   PATCH /api/interests/:id/withdraw
 * @access  Private (Investor Owner)
 */
const withdrawInterest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interest = await InvestorInterest.findById(id);
    if (!interest) return res.status(404).json({ success: false, message: 'Interest record not found' });

    if (interest.investor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this interest record' });
    }

    interest.status = 'Withdrawn';
    await interest.save();

    res.status(200).json({ success: true, message: 'Interest withdrawn', interest });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  expressInterest,
  getMyInterests,
  getStartupInterests,
  respondToInterest,
  withdrawInterest,
};
