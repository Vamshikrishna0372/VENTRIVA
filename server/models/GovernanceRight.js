const mongoose = require('mongoose');
const { GOVERNANCE_RIGHT_TYPES } = require('../config/governanceConstants');

const governanceRightSchema = new mongoose.Schema(
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
      required: [true, 'Holder User ID is required'],
      index: true,
    },
    rightType: {
      type: String,
      enum: GOVERNANCE_RIGHT_TYPES,
      required: [true, 'Right type is required'],
    },
    source: {
      type: String,
      default: 'Investor Rights Agreement / Term Sheet',
    },
    threshold: {
      type: String,
      default: 'Holds > 5% Equity',
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Expired'],
      default: 'Active',
      index: true,
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    conditions: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

governanceRightSchema.index({ startup: 1, holder: 1, rightType: 1 });

const GovernanceRight = mongoose.model('GovernanceRight', governanceRightSchema);

module.exports = GovernanceRight;
