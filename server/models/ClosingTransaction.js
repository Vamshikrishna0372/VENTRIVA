const mongoose = require('mongoose');
const {
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
  PAYMENT_STATUSES,
  SHARE_CLASSES,
} = require('../config/closingConstants');

const closingTransactionSchema = new mongoose.Schema(
  {
    fundraisingRound: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FundraisingRound',
      default: null,
      index: true,
    },
    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal',
      default: null,
      index: true,
    },
    termSheet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TermSheet',
      default: null,
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
      index: true,
    },
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investor ID is required'],
      index: true,
    },
    commitment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InvestorCommitment',
      default: null,
    },
    transactionType: {
      type: String,
      enum: TRANSACTION_TYPES,
      default: 'Priced Equity Round',
    },
    transactionStatus: {
      type: String,
      enum: TRANSACTION_STATUSES,
      default: 'Pending',
      index: true,
    },
    committedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Committed amount cannot be negative'],
    },
    finalInvestmentAmount: {
      type: Number,
      required: [true, 'Final investment amount is required'],
      min: [0, 'Final investment amount cannot be negative'],
    },
    agreedValuation: {
      type: Number,
      default: 0,
      min: [0, 'Agreed valuation cannot be negative'],
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
    ownershipPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Ownership percentage cannot be negative'],
      max: [100, 'Ownership percentage cannot exceed 100%'],
    },
    sharePrice: {
      type: Number,
      default: 0,
      min: [0, 'Share price cannot be negative'],
    },
    sharesIssued: {
      type: Number,
      default: 0,
      min: [0, 'Shares issued cannot be negative'],
    },
    shareClass: {
      type: String,
      enum: SHARE_CLASSES,
      default: 'Preferred Stock - Seed',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    expectedClosingDate: {
      type: Date,
      default: null,
    },
    actualClosingDate: {
      type: Date,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'Pending',
      index: true,
    },
    legalStatus: {
      type: String,
      enum: ['Pending', 'In Progress', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    capTableStatus: {
      type: String,
      enum: ['Pending', 'Calculated', 'Updated', 'Verified'],
      default: 'Pending',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
closingTransactionSchema.index({ startup: 1, investor: 1, deal: 1 });

const ClosingTransaction = mongoose.model('ClosingTransaction', closingTransactionSchema);

module.exports = ClosingTransaction;
