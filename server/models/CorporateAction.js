const mongoose = require('mongoose');
const { CORPORATE_ACTION_TYPES, CORPORATE_ACTION_STATUSES } = require('../config/governanceConstants');

const corporateActionSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID is required'],
      index: true,
    },
    actionType: {
      type: String,
      enum: CORPORATE_ACTION_TYPES,
      required: [true, 'Action type is required'],
    },
    title: {
      type: String,
      required: [true, 'Action title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: CORPORATE_ACTION_STATUSES,
      default: 'Draft',
      index: true,
    },
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    affectedShareholders: [
      {
        shareholder: { type: mongoose.Schema.Types.ObjectId, ref: 'Shareholder' },
        holderName: { type: String },
        sharesBefore: { type: Number, default: 0 },
        sharesAfter: { type: Number, default: 0 },
      },
    ],
    shareImpact: {
      type: Number,
      default: 0, // Positive for issuance, negative for buyback
    },
    valuationImpact: {
      type: Number,
      default: 0,
    },
    documents: [
      {
        documentName: { type: String, required: true },
        documentUrl: { type: String, default: '' },
      },
    ],
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

corporateActionSchema.index({ startup: 1, status: 1 });

const CorporateAction = mongoose.model('CorporateAction', corporateActionSchema);

module.exports = CorporateAction;
