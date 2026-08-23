const mongoose = require('mongoose');
const { RESOLUTION_TYPES, RESOLUTION_STATUSES } = require('../config/governanceConstants');

const boardResolutionSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID is required'],
      index: true,
    },
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BoardMeeting',
      default: null,
      index: true,
    },
    resolutionNumber: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Resolution title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Resolution description is required'],
    },
    resolutionType: {
      type: String,
      enum: RESOLUTION_TYPES,
      default: 'Strategic Decision',
    },
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: RESOLUTION_STATUSES,
      default: 'Draft',
      index: true,
    },
    votingStartDate: {
      type: Date,
      default: Date.now,
    },
    votingEndDate: {
      type: Date,
      required: [true, 'Voting end date is required'],
    },
    requiredApprovalPercentage: {
      type: Number,
      default: 51, // 51% simple majority or 75% supermajority
      min: 1,
      max: 100,
    },
    approvalPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    result: {
      type: String,
      enum: ['Approved', 'Rejected', 'Pending', 'Withdrawn'],
      default: 'Pending',
    },
    effectiveDate: {
      type: Date,
      default: null,
    },
    attachments: [
      {
        documentName: { type: String, required: true },
        documentUrl: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

boardResolutionSchema.index({ startup: 1, status: 1 });

const BoardResolution = mongoose.model('BoardResolution', boardResolutionSchema);

module.exports = BoardResolution;
