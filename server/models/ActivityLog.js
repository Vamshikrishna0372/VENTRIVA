const mongoose = require('mongoose');

/**
 * Unified Polymorphic Activity & Audit Log Schema
 * Consolidates ClosingActivity, DealActivity, FundraisingActivity, GovernanceActivity, PortfolioActivity, & PipelineHistory
 */
const activityLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    activityType: {
      type: String,
      enum: ['closing', 'deal', 'fundraising', 'governance', 'portfolio', 'pipeline', 'admin'],
      required: [true, 'Activity type is required'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    // Context Entity References (Polymorphic Target)
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      default: null,
      index: true,
    },
    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal',
      default: null,
      index: true,
    },
    fundraisingRound: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FundraisingRound',
      default: null,
      index: true,
    },
    closingTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClosingTransaction',
      default: null,
      index: true,
    },
    investment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investment',
      default: null,
      index: true,
    },
    pipelineEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PipelineEntry',
      default: null,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ startup: 1, createdAt: -1 });
activityLogSchema.index({ deal: 1, createdAt: -1 });
activityLogSchema.index({ fundraisingRound: 1, createdAt: -1 });
activityLogSchema.index({ closingTransaction: 1, createdAt: -1 });
activityLogSchema.index({ activityType: 1, createdAt: -1 });

// Audit logs are immutable
activityLogSchema.pre('updateOne', function () {
  throw new Error('ActivityLog records are immutable audit logs and cannot be updated.');
});
activityLogSchema.pre('findOneAndUpdate', function () {
  throw new Error('ActivityLog records are immutable audit logs and cannot be updated.');
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
