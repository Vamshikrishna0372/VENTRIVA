const mongoose = require('mongoose');
const { EQUITY_POOL_TYPES, EQUITY_POOL_STATUSES } = require('../config/governanceConstants');

const equityPoolSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID is required'],
      index: true,
    },
    poolType: {
      type: String,
      enum: EQUITY_POOL_TYPES,
      default: 'ESOP Pool',
    },
    name: {
      type: String,
      required: [true, 'Pool name is required'],
      trim: true,
    },
    totalShares: {
      type: Number,
      required: [true, 'Total pool shares is required'],
      min: [0, 'Shares cannot be negative'],
    },
    allocatedShares: {
      type: Number,
      default: 0,
      min: [0, 'Allocated shares cannot be negative'],
    },
    availableShares: {
      type: Number,
      required: true,
      min: [0, 'Available shares cannot be negative'],
    },
    reservedShares: {
      type: Number,
      default: 0,
      min: [0, 'Reserved shares cannot be negative'],
    },
    poolPercentage: {
      type: Number,
      default: 10, // Default 10% ESOP pool
      min: [0, 'Pool percentage cannot be negative'],
      max: [100, 'Pool percentage cannot exceed 100%'],
    },
    status: {
      type: String,
      enum: EQUITY_POOL_STATUSES,
      default: 'Active',
      index: true,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    approvalDate: {
      type: Date,
      default: Date.now,
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

equityPoolSchema.index({ startup: 1, poolType: 1 }, { unique: true });

const EquityPool = mongoose.model('EquityPool', equityPoolSchema);

module.exports = EquityPool;
