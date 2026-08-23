const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Startup = require('../models/Startup');

/**
 * @desc    Get user's conversations (Founder or Investor)
 * @route   GET /api/conversations
 * @access  Private
 */
const getMyConversations = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'founder') query.founder = req.user._id;
    else if (req.user.role === 'investor') query.investor = req.user._id;
    else query = { $or: [{ founder: req.user._id }, { investor: req.user._id }] };

    const conversations = await Conversation.find(query)
      .populate('startup', 'startupName sector stage logo tagline')
      .populate('founder', 'name email organization avatar')
      .populate('investor', 'name email organization avatar')
      .populate('lastMessageBy', 'name')
      .sort({ lastMessageAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get conversation by ID
 * @route   GET /api/conversations/:id
 * @access  Private (Participants only)
 */
const getConversationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Conversation ObjectId format' });
    }

    const conversation = await Conversation.findById(id)
      .populate('startup', 'startupName sector stage logo tagline')
      .populate('founder', 'name email organization avatar')
      .populate('investor', 'name email organization avatar')
      .lean();

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation thread not found' });
    }

    const isFounder = conversation.founder._id.toString() === req.user._id.toString();
    const isInvestor = conversation.investor._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFounder && !isInvestor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not a participant in this conversation' });
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Archive conversation
 * @route   PATCH /api/conversations/:id/archive
 * @access  Private (Participants only)
 */
const archiveConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);

    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    const isParticipant =
      conversation.founder.toString() === req.user._id.toString() ||
      conversation.investor.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not a participant' });
    }

    conversation.status = conversation.status === 'Archived' ? 'Active' : 'Archived';
    await conversation.save();

    res.status(200).json({
      success: true,
      message: `Conversation ${conversation.status.toLowerCase()} successfully`,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Block conversation
 * @route   PATCH /api/conversations/:id/block
 * @access  Private (Participants only)
 */
const blockConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);

    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    const isParticipant =
      conversation.founder.toString() === req.user._id.toString() ||
      conversation.investor.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not a participant' });
    }

    conversation.status = 'Blocked';
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Conversation blocked',
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset unread count for requesting participant
 * @route   PATCH /api/conversations/:id/read
 * @access  Private (Participants only)
 */
const markConversationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    if (conversation.founder.toString() === req.user._id.toString()) {
      conversation.unreadCountFounder = 0;
    } else if (conversation.investor.toString() === req.user._id.toString()) {
      conversation.unreadCountInvestor = 0;
    }

    await conversation.save();

    // Mark unread messages in database
    await Message.updateMany(
      { conversation: conversation._id, receiver: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({ success: true, message: 'Conversation marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyConversations,
  getConversationById,
  archiveConversation,
  blockConversation,
  markConversationRead,
};
