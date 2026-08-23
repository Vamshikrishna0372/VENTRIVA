const mongoose = require('mongoose');
const { INVESTMENT_STATUSES, INVESTMENT_TYPES, EXIT_TYPES, PORTFOLIO_HEALTH_STATUSES } = require('../config/portfolioConstants');

const investmentSchema = new mongoose.Schema(
  {
    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal',
      default: null,
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
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Founder ID is required'],
      index: true,
    },
    investmentType: {
      type: String,
      enum: INVESTMENT_TYPES,
      default: 'Equity',
    },
    investmentStatus: {
      type: String,
      enum: INVESTMENT_STATUSES,
      default: 'Active',
      index: true,
    },
    healthStatus: {
      type: String,
      enum: PORTFOLIO_HEALTH_STATUSES,
      default: 'Healthy',
    },
    healthScore: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
    investmentAmount: {
      type: Number,
      required: [true, 'Investment amount is required'],
      min: [0, 'Investment amount cannot be negative'],
    },
    investmentCurrency: {
      type: String,
      default: 'USD',
    },
    investmentDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ownershipPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Ownership percentage cannot be negative'],
      max: [100, 'Ownership percentage cannot exceed 100%'],
    },
    sharesOwned: {
      type: Number,
      default: 0,
      min: 0,
    },
    sharePrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    preMoneyValuation: {
      type: Number,
      default: 0,
      min: 0,
    },
    postMoneyValuation: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentValuation: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    realizedValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    unrealizedValue: {
      type: Number,
      default: 0,
    },
    totalInvested: {
      type: Number,
      default: 0,
      min: 0,
    },
    followOnInvested: {
      type: Number,
      default: 0,
      min: 0,
    },
    returnMultiple: {
      type: Number,
      default: 1.0,
      min: 0,
    },
    irr: {
      type: Number,
      default: 0,
    },
    exitType: {
      type: String,
      enum: [...EXIT_TYPES, 'None'],
      default: 'None',
    },
    exitDate: {
      type: Date,
      default: null,
    },
    exitValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    milestones: [
      {
        title: { type: String, required: true },
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
  },
  {
    timestamps: true,
  }
);

// Compound Index: One investment record per investor-startup pair per closed deal
investmentSchema.index({ investor: 1, startup: 1, deal: 1 }, { unique: true });

const Investment = mongoose.model('Investment', investmentSchema);

module.exports = Investment;
