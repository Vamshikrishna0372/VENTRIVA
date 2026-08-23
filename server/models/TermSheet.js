const mongoose = require('mongoose');
const { TERM_SHEET_STATUSES } = require('../config/dealConstants');

const termSheetSchema = new mongoose.Schema(
  {
    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal',
      required: [true, 'Deal ID is required'],
      index: true,
    },
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID is required'],
    },
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investor ID is required'],
    },
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Founder ID is required'],
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    investmentAmount: {
      type: Number,
      required: [true, 'Investment amount is required'],
      min: [0, 'Investment amount cannot be negative'],
    },
    preMoneyValuation: {
      type: Number,
      required: [true, 'Pre-money valuation is required'],
      min: [0, 'Pre-money valuation cannot be negative'],
    },
    postMoneyValuation: {
      type: Number,
      default: 0,
      min: [0, 'Post-money valuation cannot be negative'],
    },
    liquidationPreference: {
      type: String,
      default: '1x Non-Participating',
    },
    boardSeats: {
      type: Number,
      default: 0,
      min: 0,
    },
    votingRights: {
      type: String,
      default: 'Standard Major Investor Voting Rights',
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    status: {
      type: String,
      enum: TERM_SHEET_STATUSES,
      default: 'Proposed',
    },
    notes: {
      type: String,
      default: '',
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

termSheetSchema.index({ deal: 1, version: -1 });

const TermSheet = mongoose.model('TermSheet', termSheetSchema);

module.exports = TermSheet;
