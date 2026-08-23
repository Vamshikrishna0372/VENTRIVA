const mongoose = require('mongoose');

const investorStrategySchema = new mongoose.Schema(
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investor ID is required'],
      index: true,
    },
    strategyName: {
      type: String,
      required: [true, 'Strategy name is required'],
      default: 'Core Venture Allocation Strategy',
    },
    description: {
      type: String,
      default: '',
    },
    targetCapitalDeployment: {
      type: Number,
      default: 5000000,
      min: [0, 'Target deployment cannot be negative'],
    },
    targetInitialCheckSize: {
      type: Number,
      default: 250000,
      min: 0,
    },
    targetFollowOnReserve: {
      type: Number,
      default: 40, // 40% reserve
      min: 0,
      max: 100,
    },
    targetOwnershipRange: {
      min: { type: Number, default: 5, min: 0, max: 100 },
      max: { type: Number, default: 20, min: 0, max: 100 },
    },
    targetSectorAllocations: [
      {
        sector: { type: String, required: true },
        percentage: { type: Number, required: true, min: 0, max: 100 },
      },
    ],
    targetStageAllocations: [
      {
        stage: { type: String, required: true },
        percentage: { type: Number, required: true, min: 0, max: 100 },
      },
    ],
    investmentHorizonYears: {
      type: Number,
      default: 5,
      min: 1,
    },
    targetReturnMultiple: {
      type: Number,
      default: 3.0,
      min: 1.0,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

investorStrategySchema.index({ investor: 1, active: 1 });

const InvestorStrategy = mongoose.model('InvestorStrategy', investorStrategySchema);

module.exports = InvestorStrategy;
