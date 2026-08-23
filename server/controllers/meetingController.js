const mongoose = require('mongoose');
const Meeting = require('../models/Meeting');
const Startup = require('../models/Startup');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

/**
 * @desc    Request a meeting between Founder and Investor
 * @route   POST /api/meetings
 * @access  Private
 */
const requestMeeting = async (req, res, next) => {
  try {
    const { startupId, investorId, title, description, scheduledStart, scheduledEnd, meetingType, meetingLink, location, timezone } = req.body;

    if (!mongoose.Types.ObjectId.isValid(startupId)) {
      return res.status(400).json({ success: false, message: 'Invalid Startup ObjectId format' });
    }

    const startup = await Startup.findById(startupId);
    if (!startup || startup.isDeleted) {
      return res.status(404).json({ success: false, message: 'Startup profile unavailable' });
    }

    // Time validations
    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid scheduled start or end timestamp' });
    }

    if (start < now) {
      return res.status(400).json({ success: false, message: 'Cannot schedule meetings in the past' });
    }

    if (end <= start) {
      return res.status(400).json({ success: false, message: 'Scheduled end time must be after start time' });
    }

    let founderId = startup.founder;
    let targetInvestorId = investorId;

    if (req.user.role === 'founder') {
      if (startup.founder.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Forbidden: You do not own this startup' });
      }
      if (!targetInvestorId) {
        return res.status(400).json({ success: false, message: 'Investor ID is required when founder requests meeting' });
      }
    } else if (req.user.role === 'investor') {
      targetInvestorId = req.user._id;
    }

    // Find conversation thread if exists
    const conversation = await Conversation.findOne({ startup: startup._id, investor: targetInvestorId });

    const meeting = await Meeting.create({
      startup: startup._id,
      founder: founderId,
      investor: targetInvestorId,
      conversation: conversation ? conversation._id : null,
      title: title ? title.trim() : `Introductory Meeting — ${startup.startupName}`,
      description: description ? description.trim() : '',
      scheduledStart: start,
      scheduledEnd: end,
      timezone: timezone || 'UTC',
      meetingType: meetingType || 'Video Call',
      meetingLink: meetingLink ? meetingLink.trim() : '',
      location: location ? location.trim() : '',
      status: 'Requested',
      requestedBy: req.user._id,
    });

    const recipientId = req.user._id.toString() === founderId.toString() ? targetInvestorId : founderId;

    // Create Notification alert
    await Notification.create({
      user: recipientId,
      type: 'MeetingRequest',
      title: `Meeting Requested: ${meeting.title}`,
      message: `${req.user.name} requested a ${meeting.meetingType} on ${start.toLocaleDateString()}`,
      relatedEntityType: 'Meeting',
      relatedEntityId: meeting._id,
    });

    res.status(201).json({
      success: true,
      message: 'Meeting requested successfully',
      meeting,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's meetings (Founder or Investor)
 * @route   GET /api/meetings
 * @access  Private
 */
const getMyMeetings = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};

    if (req.user.role === 'founder') query.founder = req.user._id;
    else if (req.user.role === 'investor') query.investor = req.user._id;
    else query = { $or: [{ founder: req.user._id }, { investor: req.user._id }] };

    if (status && status !== 'all') {
      query.status = status;
    }

    const meetings = await Meeting.find(query)
      .populate('startup', 'startupName sector stage logo')
      .populate('founder', 'name email organization avatar')
      .populate('investor', 'name email organization avatar')
      .sort({ scheduledStart: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: meetings.length,
      meetings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get meeting detail by ID
 * @route   GET /api/meetings/:id
 * @access  Private (Participants only)
 */
const getMeetingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findById(id)
      .populate('startup', 'startupName sector stage logo tagline')
      .populate('founder', 'name email organization avatar')
      .populate('investor', 'name email organization avatar')
      .lean();

    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

    const isParticipant =
      meeting.founder._id.toString() === req.user._id.toString() ||
      meeting.investor._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not a participant in this meeting' });
    }

    res.status(200).json({ success: true, meeting });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Confirm requested meeting
 * @route   PATCH /api/meetings/:id/confirm
 * @access  Private (Participant)
 */
const confirmMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { meetingLink } = req.body;

    const meeting = await Meeting.findById(id);
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

    const isParticipant =
      meeting.founder.toString() === req.user._id.toString() ||
      meeting.investor.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    meeting.status = 'Confirmed';
    if (meetingLink) meeting.meetingLink = meetingLink.trim();
    if (!meeting.meetingLink && meeting.meetingType === 'Video Call') {
      meeting.meetingLink = `https://meet.jit.si/ventriva-${meeting._id}`;
    }
    await meeting.save();

    const recipientId = req.user._id.toString() === meeting.founder.toString() ? meeting.investor : meeting.founder;

    await Notification.create({
      user: recipientId,
      type: 'MeetingConfirmed',
      title: `Meeting Confirmed: ${meeting.title}`,
      message: `${req.user.name} confirmed the meeting for ${new Date(meeting.scheduledStart).toLocaleDateString()}`,
      relatedEntityType: 'Meeting',
      relatedEntityId: meeting._id,
    });

    res.status(200).json({ success: true, message: 'Meeting confirmed', meeting });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Decline requested meeting
 * @route   PATCH /api/meetings/:id/decline
 * @access  Private (Participant)
 */
const declineMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const meeting = await Meeting.findById(id);
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

    const isParticipant =
      meeting.founder.toString() === req.user._id.toString() ||
      meeting.investor.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    meeting.status = 'Declined';
    if (cancellationReason) meeting.cancellationReason = cancellationReason.trim();
    await meeting.save();

    const recipientId = req.user._id.toString() === meeting.founder.toString() ? meeting.investor : meeting.founder;

    await Notification.create({
      user: recipientId,
      type: 'MeetingDeclined',
      title: `Meeting Declined: ${meeting.title}`,
      message: `${req.user.name} declined the meeting request.`,
      relatedEntityType: 'Meeting',
      relatedEntityId: meeting._id,
    });

    res.status(200).json({ success: true, message: 'Meeting declined', meeting });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel scheduled meeting
 * @route   PATCH /api/meetings/:id/cancel
 * @access  Private (Participant)
 */
const cancelMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const meeting = await Meeting.findById(id);
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

    const isParticipant =
      meeting.founder.toString() === req.user._id.toString() ||
      meeting.investor.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    meeting.status = 'Cancelled';
    if (cancellationReason) meeting.cancellationReason = cancellationReason.trim();
    await meeting.save();

    const recipientId = req.user._id.toString() === meeting.founder.toString() ? meeting.investor : meeting.founder;

    await Notification.create({
      user: recipientId,
      type: 'MeetingCancelled',
      title: `Meeting Cancelled: ${meeting.title}`,
      message: `${req.user.name} cancelled the scheduled meeting.`,
      relatedEntityType: 'Meeting',
      relatedEntityId: meeting._id,
    });

    res.status(200).json({ success: true, message: 'Meeting cancelled', meeting });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark meeting as Completed
 * @route   PATCH /api/meetings/:id/complete
 * @access  Private (Participant)
 */
const completeMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const meeting = await Meeting.findById(id);
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

    meeting.status = 'Completed';
    if (notes) meeting.notes = notes.trim();
    await meeting.save();

    res.status(200).json({ success: true, message: 'Meeting marked as completed', meeting });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestMeeting,
  getMyMeetings,
  getMeetingById,
  confirmMeeting,
  declineMeeting,
  cancelMeeting,
  completeMeeting,
};
