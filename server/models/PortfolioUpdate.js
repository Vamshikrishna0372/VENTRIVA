const mongoose = require('mongoose');

const portfolioUpdateSchema = new mongoose.Schema(
  {
    investment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investment',
      required: [true, 'Investment ID is required'],
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
      index: true,
    },
    reportingPeriod: {
      type: String,
      required: [true, 'Reporting period (e.g. Q3 2026, Aug 2026) is required'],
      trim: true,
    },
    reportingDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    revenue: {
      type: Number,
      default: 0,
      min: [0, 'Revenue cannot be negative'],
    },
    revenueGrowth: {
      type: Number,
      default: 0,
    },
    monthlyRecurringRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    annualRecurringRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    customerCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    userCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    burnRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    runwayMonths: {
      type: Number,
      default: 12,
      min: 0,
    },
    employeeCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    cashBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    majorMilestones: {
      type: String,
      default: '',
    },
    keyWins: {
      type: String,
      default: '',
    },
    keyChallenges: {
      type: String,
      default: '',
    },
    fundingStatus: {
      type: String,
      default: 'Not Currently Fundraising',
    },
    nextFundingTarget: {
      type: String,
      default: '',
    },
    outlook: {
      type: String,
      enum: ['Optimistic', 'Stable', 'Cautious', 'Challenged'],
      default: 'Stable',
    },
    founderNotes: {
      type: String,
      default: '',
      maxlength: [2000, 'Founder notes cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Acknowledged'],
      default: 'Submitted',
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

portfolioUpdateSchema.index({ investment: 1, reportingPeriod: 1 });

const PortfolioUpdate = mongoose.model('PortfolioUpdate', portfolioUpdateSchema);

module.exports = PortfolioUpdate;
