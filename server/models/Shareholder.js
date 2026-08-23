const mongoose = require('mongoose');
const { SHARE_CLASSES } = require('../config/closingConstants');

const shareholderSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    investment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investment',
      default: null,
    },
    shareholding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shareholding',
      default: null,
    },
    holderName: {
      type: String,
      required: [true, 'Shareholder name is required'],
      trim: true,
    },
    holderType: {
      type: String,
      enum: ['Founder', 'Investor', 'ESOP Pool', 'Other'],
      default: 'Founder',
    },
    shareClass: {
      type: String,
      enum: SHARE_CLASSES,
      default: 'Common Stock',
    },
    sharesOwned: {
      type: Number,
      required: [true, 'Shares owned is required'],
      min: [0, 'Shares owned cannot be negative'],
    },
    ownershipPercentage: {
      type: Number,
      required: [true, 'Ownership percentage is required'],
      min: [0, 'Ownership percentage cannot be negative'],
      max: [100, 'Ownership percentage cannot exceed 100%'],
    },
    votingPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Voting percentage cannot be negative'],
      max: [100, 'Voting percentage cannot exceed 100%'],
    },
    acquisitionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Transferred'],
      default: 'Active',
      index: true,
    },
    votingRights: {
      type: Boolean,
      default: true,
    },
    boardRights: {
      type: Boolean,
      default: false,
    },
    informationRights: {
      type: Boolean,
      default: true,
    },
    proRataRights: {
      type: Boolean,
      default: false,
    },
    transferRestrictions: {
      type: String,
      default: 'Subject to Board & Founder ROFR',
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

shareholderSchema.index({ startup: 1, status: 1 });
shareholderSchema.index({ startup: 1, user: 1 });

const Shareholder = mongoose.model('Shareholder', shareholderSchema);

module.exports = Shareholder;
