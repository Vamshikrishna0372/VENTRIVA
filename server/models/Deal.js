const mongoose = require('mongoose');
const { DEAL_STATUSES, DEAL_TYPES } = require('../config/dealConstants');

const dealSchema = new mongoose.Schema(
  {
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
    pipelineEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PipelineEntry',
      default: null,
    },
    status: {
      type: String,
      enum: DEAL_STATUSES,
      default: 'Active',
    },
    targetInvestment: {
      type: Number,
      default: 0,
      min: [0, 'Target investment amount cannot be negative'],
    },
    valuation: {
      type: Number,
      default: 0,
      min: [0, 'Valuation cannot be negative'],
    },
    dealType: {
      type: String,
      enum: DEAL_TYPES,
      default: 'Priced Equity Round',
    },
    closingDate: {
      type: Date,
      default: null,
    },
    leadInvestor: {
      type: String,
      default: '',
    },
    termsSummary: {
      type: String,
      default: '',
      maxlength: [2000, 'Terms summary cannot exceed 2000 characters'],
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
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: One active deal per startup + investor pair
dealSchema.index({ startup: 1, investor: 1 }, { unique: true });

const Deal = mongoose.model('Deal', dealSchema);

module.exports = Deal;
