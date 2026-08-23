const mongoose = require('mongoose');
const { ALLOCATION_STATUSES } = require('../config/strategyConstants');

const allocationItemSchema = new mongoose.Schema({
  startup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Startup',
    required: true,
  },
  proposedAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  expectedOwnership: {
    type: Number,
    default: 10,
    min: 0,
    max: 100,
  },
  expectedValuation: {
    type: Number,
    default: 0,
    min: 0,
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'High',
  },
  rationale: {
    type: String,
    default: '',
  },
});

const capitalAllocationPlanSchema = new mongoose.Schema(
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investor ID is required'],
      index: true,
    },
    strategy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InvestorStrategy',
      default: null,
    },
    planningPeriod: {
      type: String,
      required: [true, 'Planning period is required'],
    },
    totalAvailableCapital: {
      type: Number,
      required: true,
      min: 0,
    },
    alreadyDeployedCapital: {
      type: Number,
      default: 0,
      min: 0,
    },
    reservedFollowOnCapital: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableForNewInvestments: {
      type: Number,
      default: 0,
      min: 0,
    },
    proposedAllocations: [allocationItemSchema],
    totalProposedCapital: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingCapital: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ALLOCATION_STATUSES,
      default: 'Draft',
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

capitalAllocationPlanSchema.index({ investor: 1, planningPeriod: 1 });

const CapitalAllocationPlan = mongoose.model('CapitalAllocationPlan', capitalAllocationPlanSchema);

module.exports = CapitalAllocationPlan;
