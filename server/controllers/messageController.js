const mongoose = require('mongoose');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

/**
 * @desc    Send a message in a conversation thread
 * @route   POST /api/messages/:conversationId
 * @access  Private (Participants only)
 */
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty' });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({ success: false, message: 'Message text exceeds 2000 characters limit' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation thread not found' });
    }

    if (conversation.status === 'Blocked') {
      return res.status(403).json({ success: false, message: 'Forbidden: Communication thread has been blocked' });
    }

    const isFounder = conversation.founder.toString() === req.user._id.toString();
    const isInvestor = conversation.investor.toString() === req.user._id.toString();

    if (!isFounder && !isInvestor) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not a participant in this conversation' });
    }

    const receiverId = isFounder ? conversation.investor : conversation.founder;

    const newMsg = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver: receiverId,
      message: message.trim(),
      messageType: 'Text',
    });

    // Update Conversation thread stats
    conversation.lastMessageAt = new Date();
    conversation.lastMessageBy = req.user._id;

    if (isFounder) {
      conversation.unreadCountInvestor += 1;
    } else {
      conversation.unreadCountFounder += 1;
    }
    await conversation.save();

    // Create Notification alert for recipient
    await Notification.create({
      user: receiverId,
      type: 'NewMessage',
      title: `New message from ${req.user.name}`,
      message: message.trim().substring(0, 100) + (message.length > 100 ? '...' : ''),
      relatedEntityType: 'Conversation',
      relatedEntityId: conversation._id,
    });

    const populatedMsg = await Message.findById(newMsg._id).populate('sender', 'name email avatar').lean();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMsg,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get message history for a conversation
 * @route   GET /api/messages/:conversationId
 * @access  Private (Participants only)
 */
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation thread not found' });
    }

    const isFounder = conversation.founder.toString() === req.user._id.toString();
    const isInvestor = conversation.investor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFounder && !isInvestor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not a participant' });
    }

    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark individual message as read
 * @route   PATCH /api/messages/:messageId/read
 * @access  Private
 */
const markMessageRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });

    if (msg.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    msg.isRead = true;
    msg.readAt = new Date();
    await msg.save();

    res.status(200).json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markMessageRead,
};
