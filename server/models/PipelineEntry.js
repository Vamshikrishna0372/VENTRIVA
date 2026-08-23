const mongoose = require('mongoose');
const { PIPELINE_STAGES, PIPELINE_PRIORITIES, PIPELINE_STATUSES, CURRENCIES } = require('../config/pipelineConstants');

const pipelineEntrySchema = new mongoose.Schema(
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investor ID is required'],
      index: true,
    },
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID is required'],
      index: true,
    },
    stage: {
      type: String,
      enum: {
        values: PIPELINE_STAGES,
        message: 'Invalid pipeline stage selected',
      },
      default: 'New',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: PIPELINE_PRIORITIES,
        message: 'Invalid priority selected',
      },
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: PIPELINE_STATUSES,
        message: 'Invalid pipeline status',
      },
      default: 'Active',
      index: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: [3000, 'Pipeline notes cannot exceed 3000 characters'],
    },
    nextFollowUpDate: {
      type: Date,
      default: null,
      index: true,
    },
    lastContactDate: {
      type: Date,
      default: null,
    },
    expectedInvestment: {
      type: Number,
      default: 0,
      min: [0, 'Expected investment cannot be negative'],
    },
    investmentCurrency: {
      type: String,
      enum: CURRENCIES,
      default: 'USD',
    },
    internalRating: {
      type: Number,
      min: [1, 'Internal rating must be between 1 and 10'],
      max: [10, 'Internal rating must be between 1 and 10'],
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: Enforces 1 active pipeline entry per investor per venture
pipelineEntrySchema.index({ investor: 1, startup: 1 }, { unique: true });

const PipelineEntry = mongoose.model('PipelineEntry', pipelineEntrySchema);

module.exports = PipelineEntry;
