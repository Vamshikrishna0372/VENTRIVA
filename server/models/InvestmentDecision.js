const mongoose = require('mongoose');
const { DECISION_TYPES, DECISION_STATUSES } = require('../config/strategyConstants');

const investmentDecisionSchema = new mongoose.Schema(
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investor ID is required'],
      index: true,
    },
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID is required'],
      index: true,
    },
    evaluation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evaluation',
      default: null,
    },
    decisionType: {
      type: String,
      enum: DECISION_TYPES,
      required: true,
    },
    decisionStatus: {
      type: String,
      enum: DECISION_STATUSES,
      default: 'Draft',
    },
    convictionScore: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
    strategicFitScore: {
      type: Number,
      default: 85,
      min: 0,
      max: 100,
    },
    riskScore: {
      type: Number,
      default: 30,
      min: 0,
      max: 100,
    },
    recommendedInvestmentAmount: {
      type: Number,
      default: 250000,
      min: 0,
    },
    recommendedOwnership: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    rationale: {
      type: String,
      default: '',
    },
    keyRisks: {
      type: String,
      default: '',
    },
    keyUpsideFactors: {
      type: String,
      default: '',
    },
    decisionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

investmentDecisionSchema.index({ investor: 1, startup: 1 });

const InvestmentDecision = mongoose.model('InvestmentDecision', investmentDecisionSchema);

module.exports = InvestmentDecision;
