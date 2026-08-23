const mongoose = require('mongoose');
const { PERFORMANCE_TRENDS } = require('../config/portfolioIntelligenceConstants');

const portfolioPerformanceSchema = new mongoose.Schema(
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
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investor ID is required'],
      index: true,
    },
    reportingPeriod: {
      type: String,
      required: [true, 'Reporting period is required'],
      trim: true,
    },
    periodStart: {
      type: Date,
      default: Date.now,
    },
    periodEnd: {
      type: Date,
      default: Date.now,
    },
    revenue: {
      type: Number,
      default: 0,
      min: 0,
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
    burnRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    cashBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    runwayMonths: {
      type: Number,
      default: 12,
      min: 0,
    },
    valuation: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    ownershipPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    performanceTrend: {
      type: String,
      enum: PERFORMANCE_TRENDS,
      default: 'Stable',
    },
    healthScore: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
    source: {
      type: String,
      default: 'Founder Update',
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

portfolioPerformanceSchema.index({ investment: 1, reportingPeriod: 1 }, { unique: true });

const PortfolioPerformance = mongoose.model('PortfolioPerformance', portfolioPerformanceSchema);

module.exports = PortfolioPerformance;
