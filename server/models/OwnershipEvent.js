const mongoose = require('mongoose');

const ownershipEventSchema = new mongoose.Schema(
  {
    investment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investment',
      default: null,
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
    eventType: {
      type: String,
      enum: [
        'Initial Investment',
        'Follow-On Investment',
        'New Funding Round',
        'Secondary Transaction',
        'Secondary Purchase',
        'Partial Exit',
        'Full Exit',
        'Ownership Adjustment',
      ],
      required: true,
    },
    previousOwnership: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    newOwnership: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    dilutionPercentage: {
      type: Number,
      default: 0,
    },
    reason: {
      type: String,
      default: 'Cap table update',
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ownershipEventSchema.index({ investment: 1, effectiveDate: -1 });

const OwnershipEvent = mongoose.model('OwnershipEvent', ownershipEventSchema);

module.exports = OwnershipEvent;
