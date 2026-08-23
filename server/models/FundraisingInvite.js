const mongoose = require('mongoose');
const { INVITE_STATUSES } = require('../config/fundraisingConstants');

const fundraisingInviteSchema = new mongoose.Schema(
  {
    fundraisingRound: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FundraisingRound',
      required: [true, 'Fundraising Round ID is required'],
      index: true,
    },
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID is required'],
      index: true,
    },
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investor ID is required'],
      index: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Inviter User ID is required'],
    },
    status: {
      type: String,
      enum: INVITE_STATUSES,
      default: 'Pending',
      index: true,
    },
    message: {
      type: String,
      default: '',
      maxlength: [1000, 'Invitation message cannot exceed 1000 characters'],
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate invitations for the same round & investor
fundraisingInviteSchema.index({ fundraisingRound: 1, investor: 1 }, { unique: true });

const FundraisingInvite = mongoose.model('FundraisingInvite', fundraisingInviteSchema);

module.exports = FundraisingInvite;
