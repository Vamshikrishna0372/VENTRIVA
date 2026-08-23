const mongoose = require('mongoose');
const { INVESTMENT_DECISIONS, EVALUATION_STATUSES } = require('../config/evaluationConstants');

const categoryScoreSchema = new mongoose.Schema(
  {
    team: { type: Number, min: 1, max: 10, default: null },
    market: { type: Number, min: 1, max: 10, default: null },
    product: { type: Number, min: 1, max: 10, default: null },
    traction: { type: Number, min: 1, max: 10, default: null },
    businessModel: { type: Number, min: 1, max: 10, default: null },
    competitiveAdvantage: { type: Number, min: 1, max: 10, default: null },
    financials: { type: Number, min: 1, max: 10, default: null },
    fundraising: { type: Number, min: 1, max: 10, default: null },
  },
  { _id: false }
);

const evaluationSchema = new mongoose.Schema(
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
    scores: {
      type: categoryScoreSchema,
      default: () => ({}),
    },
    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    strengths: {
      type: [String],
      default: [],
    },
    risks: {
      type: [String],
      default: [],
    },
    privateNotes: {
      type: String,
      default: '',
      maxlength: [3000, 'Private notes cannot exceed 3000 characters'],
    },
    investmentDecision: {
      type: String,
      enum: {
        values: INVESTMENT_DECISIONS,
        message: 'Invalid investment decision selected',
      },
      default: 'Undecided',
      index: true,
    },
    evaluationStatus: {
      type: String,
      enum: {
        values: EVALUATION_STATUSES,
        message: 'Invalid evaluation status',
      },
      default: 'Draft',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: Enforces 1 active evaluation document per investor per venture
evaluationSchema.index({ investor: 1, startup: 1 }, { unique: true });

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = Evaluation;
