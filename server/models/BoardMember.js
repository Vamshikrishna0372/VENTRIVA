const mongoose = require('mongoose');
const { BOARD_ROLES, BOARD_MEMBER_STATUSES } = require('../config/governanceConstants');

const boardMemberSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    shareholder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shareholder',
      default: null,
    },
    role: {
      type: String,
      enum: BOARD_ROLES,
      required: [true, 'Board role is required'],
    },
    appointmentDate: {
      type: Date,
      default: Date.now,
    },
    termStartDate: {
      type: Date,
      default: Date.now,
    },
    termEndDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: BOARD_MEMBER_STATUSES,
      default: 'Active',
      index: true,
    },
    votingPower: {
      type: Number,
      default: 1, // Default 1 vote per director on board resolutions
      min: 0,
    },
    committeeMemberships: [
      {
        type: String,
        trim: true,
      },
    ],
    appointmentReason: {
      type: String,
      default: 'Series Seed Investor Rights Agreement',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

boardMemberSchema.index({ startup: 1, user: 1 }, { unique: true });
boardMemberSchema.index({ startup: 1, status: 1 });

const BoardMember = mongoose.model('BoardMember', boardMemberSchema);

module.exports = BoardMember;
