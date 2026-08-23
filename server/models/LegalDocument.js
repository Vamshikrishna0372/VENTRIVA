const mongoose = require('mongoose');
const { LEGAL_DOCUMENT_TYPES, LEGAL_DOCUMENT_STATUSES } = require('../config/closingConstants');

const legalDocumentSchema = new mongoose.Schema(
  {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClosingTransaction',
      required: [true, 'Closing Transaction ID is required'],
      index: true,
    },
    documentType: {
      type: String,
      enum: LEGAL_DOCUMENT_TYPES,
      required: [true, 'Legal document type is required'],
    },
    documentName: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    documentReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    documentUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: LEGAL_DOCUMENT_STATUSES,
      default: 'Required',
      index: true,
    },
    required: {
      type: Boolean,
      default: true,
    },
    signed: {
      type: Boolean,
      default: false,
    },
    signedByFounder: {
      type: Boolean,
      default: false,
    },
    signedByInvestor: {
      type: Boolean,
      default: false,
    },
    signedAt: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
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

legalDocumentSchema.index({ transaction: 1, documentType: 1 });

const LegalDocument = mongoose.model('LegalDocument', legalDocumentSchema);

module.exports = LegalDocument;
