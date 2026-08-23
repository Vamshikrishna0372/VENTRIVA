const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Target User ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: [
        'InvestorInterest',
        'InterestResponse',
        'NewMessage',
        'MeetingRequest',
        'MeetingConfirmed',
        'MeetingDeclined',
        'MeetingCancelled',
        'MeetingReminder',
        'DocumentRequest',
        'System',
        'FundraisingInvite',
        'CommitmentUpdate',
        'RoundStatusChange',
        'DealUpdate',
        'DEAL_UPDATE',
      ],
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    relatedEntityType: {
      type: String,
      default: '',
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
