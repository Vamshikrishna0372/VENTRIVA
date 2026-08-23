const mongoose = require('mongoose');
const { SHARE_TRANSFER_STATUSES } = require('../config/governanceConstants');
const { SHARE_CLASSES } = require('../config/closingConstants');

const shareTransferSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID is required'],
      index: true,
    },
    fromShareholder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shareholder',
      required: [true, 'Transferor shareholder ID is required'],
      index: true,
    },
    toShareholder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shareholder',
      default: null,
    },
    buyerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    buyerName: {
      type: String,
      required: [true, 'Buyer name is required'],
      trim: true,
    },
    shareClass: {
      type: String,
      enum: SHARE_CLASSES,
      default: 'Common Stock',
    },
    shares: {
      type: Number,
      required: [true, 'Transfer share count is required'],
      min: [1, 'Must transfer at least 1 share'],
    },
    pricePerShare: {
      type: Number,
      required: [true, 'Price per share is required'],
      min: [0, 'Price per share cannot be negative'],
    },
    totalValue: {
      type: Number,
      required: true,
      min: [0, 'Total value cannot be negative'],
    },
    reason: {
      type: String,
      default: 'Secondary Transfer',
    },
    status: {
      type: String,
      enum: SHARE_TRANSFER_STATUSES,
      default: 'Proposed',
      index: true,
    },
    proposedDate: {
      type: Date,
      default: Date.now,
    },
    approvedDate: {
      type: Date,
      default: null,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    transferRestrictions: {
      type: String,
      default: 'Board ROFR Waived',
    },
    supportingDocuments: [
      {
        documentName: { type: String, required: true },
        documentUrl: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

shareTransferSchema.index({ startup: 1, status: 1 });

const ShareTransfer = mongoose.model('ShareTransfer', shareTransferSchema);

module.exports = ShareTransfer;
