const mongoose = require('mongoose');
const { SIGNATURE_ROLES, SIGNATURE_STATUSES } = require('../config/closingConstants');

const signatureRecordSchema = new mongoose.Schema(
  {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClosingTransaction',
      required: [true, 'Closing Transaction ID is required'],
      index: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LegalDocument',
      required: [true, 'Legal Document ID is required'],
      index: true,
    },
    signer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Signer User ID is required'],
      index: true,
    },
    signerRole: {
      type: String,
      enum: SIGNATURE_ROLES,
      required: true,
    },
    status: {
      type: String,
      enum: SIGNATURE_STATUSES,
      default: 'Pending',
    },
    signedAt: {
      type: Date,
      default: null,
    },
    signatureReference: {
      type: String,
      default: '',
    },
    verificationStatus: {
      type: String,
      enum: ['Verified', 'Pending', 'Failed'],
      default: 'Verified',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

signatureRecordSchema.index({ document: 1, signer: 1 }, { unique: true });

const SignatureRecord = mongoose.model('SignatureRecord', signatureRecordSchema);

module.exports = SignatureRecord;
