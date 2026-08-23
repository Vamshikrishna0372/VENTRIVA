const mongoose = require('mongoose');
const { ROUND_TYPES, ROUND_STATUSES } = require('../config/fundraisingConstants');

const fundraisingRoundSchema = new mongoose.Schema(
  {
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
      index: true,
    },
    roundType: {
      type: String,
      enum: ROUND_TYPES,
      required: [true, 'Round type is required'],
    },
    roundName: {
      type: String,
      required: [true, 'Round name is required'],
      trim: true,
      maxlength: [120, 'Round name cannot exceed 120 characters'],
    },
    status: {
      type: String,
      enum: ROUND_STATUSES,
      default: 'Draft',
      index: true,
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [0, 'Target amount cannot be negative'],
    },
    minimumAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum amount cannot be negative'],
    },
    maximumAmount: {
      type: Number,
      default: 0,
      min: [0, 'Maximum amount cannot be negative'],
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
    preMoneyValuation: {
      type: Number,
      default: 0,
      min: [0, 'Pre-money valuation cannot be negative'],
    },
    postMoneyValuation: {
      type: Number,
      default: 0,
      min: [0, 'Post-money valuation cannot be negative'],
    },
    targetOwnershipPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Target ownership percentage cannot be negative'],
      max: [100, 'Target ownership percentage cannot exceed 100%'],
    },
    minimumTicketSize: {
      type: Number,
      default: 0,
      min: [0, 'Minimum ticket size cannot be negative'],
    },
    maximumTicketSize: {
      type: Number,
      default: 0,
      min: [0, 'Maximum ticket size cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
    },
    openingDate: {
      type: Date,
      default: null,
      index: true,
    },
    targetClosingDate: {
      type: Date,
      default: null,
      index: true,
    },
    actualClosingDate: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    useOfFunds: {
      type: String,
      default: '',
      maxlength: [2000, 'Use of funds description cannot exceed 2000 characters'],
    },
    leadInvestor: {
      type: String,
      default: '',
      trim: true,
    },
    allowNewInvestors: {
      type: Boolean,
      default: true,
    },
    allowExistingInvestors: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
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
    milestones: [
      {
        title: { type: String, required: true },
        targetAmount: { type: Number, default: 0 },
        targetDate: { type: Date, default: null },
        status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending' },
        completedAt: { type: Date, default: null },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    notes: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        noteText: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    documentLinks: [
      {
        document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
        linkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Custom pre-validate bounds checking
fundraisingRoundSchema.pre('validate', function (next) {
  if (this.minimumAmount > 0 && this.targetAmount > 0 && this.minimumAmount > this.targetAmount) {
    this.invalidate('minimumAmount', 'Minimum target amount cannot be greater than target amount');
  }
  if (this.maximumAmount > 0 && this.minimumAmount > 0 && this.maximumAmount < this.minimumAmount) {
    this.invalidate('maximumAmount', 'Maximum amount cannot be less than minimum amount');
  }
  if (this.minimumTicketSize > 0 && this.maximumTicketSize > 0 && this.minimumTicketSize > this.maximumTicketSize) {
    this.invalidate('minimumTicketSize', 'Minimum ticket size cannot be greater than maximum ticket size');
  }
  next();
});

// Indexes for common queries
fundraisingRoundSchema.index({ startup: 1, status: 1 });
fundraisingRoundSchema.index({ founder: 1, isArchived: 1 });

const FundraisingRound = mongoose.model('FundraisingRound', fundraisingRoundSchema);

module.exports = FundraisingRound;
