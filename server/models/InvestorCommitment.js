const mongoose = require('mongoose');
const { COMMITMENT_STATUSES, INVESTOR_ROLES } = require('../config/fundraisingConstants');

const investorCommitmentSchema = new mongoose.Schema(
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
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Founder ID is required'],
    },
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investor ID is required'],
      index: true,
    },
    commitmentStatus: {
      type: String,
      enum: COMMITMENT_STATUSES,
      default: 'Interested',
      index: true,
    },
    investorRole: {
      type: String,
      enum: INVESTOR_ROLES,
      default: 'Participant',
    },
    requestedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Requested amount cannot be negative'],
    },
    committedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Committed amount cannot be negative'],
    },
    fundedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Funded amount cannot be negative'],
    },
    proposedOwnership: {
      type: Number,
      default: 0,
      min: [0, 'Proposed ownership percentage cannot be negative'],
      max: [100, 'Proposed ownership percentage cannot exceed 100%'],
    },
    proposedValuation: {
      type: Number,
      default: 0,
      min: [0, 'Proposed valuation cannot be negative'],
    },
    message: {
      type: String,
      default: '',
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    notes: {
      type: String,
      default: '',
      maxlength: [1000, 'Private notes cannot exceed 1000 characters'],
    },
    source: {
      type: String,
      default: 'Platform Discovery',
    },
    committedAt: {
      type: Date,
      default: null,
    },
    fundedAt: {
      type: Date,
      default: null,
    },
    withdrawnAt: {
      type: Date,
      default: null,
    },
    declineReason: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate commitments for the same investor & round pair
investorCommitmentSchema.index({ fundraisingRound: 1, investor: 1 }, { unique: true });

const InvestorCommitment = mongoose.model('InvestorCommitment', investorCommitmentSchema);

module.exports = InvestorCommitment;
