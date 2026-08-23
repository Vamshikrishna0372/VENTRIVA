const mongoose = require('mongoose');
const { SCENARIO_TYPES } = require('../config/strategyConstants');

const portfolioScenarioSchema = new mongoose.Schema(
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investor ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Scenario name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    scenarioType: {
      type: String,
      enum: SCENARIO_TYPES,
      default: 'Base Case',
    },
    assumptions: {
      valuationChangePercentage: { type: Number, default: 0 },
      newCapitalDeployment: { type: Number, default: 0 },
      followOnMultiplier: { type: Number, default: 1.0 },
      exitMultiplier: { type: Number, default: 1.0 },
    },
    projectedCapital: {
      type: Number,
      default: 0,
    },
    projectedPortfolioValue: {
      type: Number,
      default: 0,
    },
    projectedMOIC: {
      type: Number,
      default: 1.0,
    },
    results: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

portfolioScenarioSchema.index({ investor: 1, createdAt: -1 });

const PortfolioScenario = mongoose.model('PortfolioScenario', portfolioScenarioSchema);

module.exports = PortfolioScenario;
