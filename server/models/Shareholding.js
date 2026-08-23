const mongoose = require('mongoose');
const { SHARE_CLASSES } = require('../config/closingConstants');

const shareholdingSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID is required'],
      index: true,
    },
    holder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    holderName: {
      type: String,
      required: [true, 'Holder name is required'],
      trim: true,
    },
    holderType: {
      type: String,
      enum: ['Founder', 'Investor', 'ESOP Pool', 'Other'],
      default: 'Founder',
    },
    shares: {
      type: Number,
      required: [true, 'Share count is required'],
      min: [0, 'Shares cannot be negative'],
    },
    ownershipPercentage: {
      type: Number,
      required: [true, 'Ownership percentage is required'],
      min: [0, 'Ownership percentage cannot be negative'],
      max: [100, 'Ownership percentage cannot exceed 100%'],
    },
    shareClass: {
      type: String,
      enum: SHARE_CLASSES,
      default: 'Common Stock',
    },
    acquisitionCost: {
      type: Number,
      default: 0,
      min: [0, 'Acquisition cost cannot be negative'],
    },
    acquisitionDate: {
      type: Date,
      default: Date.now,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

shareholdingSchema.index({ startup: 1, active: 1 });

const Shareholding = mongoose.model('Shareholding', shareholdingSchema);

module.exports = Shareholding;
