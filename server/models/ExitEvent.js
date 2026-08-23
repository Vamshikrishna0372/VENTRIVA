const mongoose = require('mongoose');
const { EXIT_TYPES, EXIT_STATUSES } = require('../config/portfolioIntelligenceConstants');

const exitEventSchema = new mongoose.Schema(
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
    },
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investor ID is required'],
      index: true,
    },
    exitType: {
      type: String,
      enum: EXIT_TYPES,
      required: true,
    },
    exitStatus: {
      type: String,
      enum: EXIT_STATUSES,
      default: 'Planned',
      index: true,
    },
    proposedDate: {
      type: Date,
      default: Date.now,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    exitValue: {
      type: Number,
      default: 0,
      min: [0, 'Exit value cannot be negative'],
    },
    realizedGain: {
      type: Number,
      default: 0,
    },
    realizedMultiple: {
      type: Number,
      default: 1.0,
      min: 0,
    },
    buyerName: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

exitEventSchema.index({ investment: 1, exitStatus: 1 });

const ExitEvent = mongoose.model('ExitEvent', exitEventSchema);

module.exports = ExitEvent;
