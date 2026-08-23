const mongoose = require('mongoose');

const capTableSnapshotSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID is required'],
      index: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClosingTransaction',
      default: null,
      index: true,
    },
    snapshotDate: {
      type: Date,
      default: Date.now,
    },
    preTransactionOwnership: [
      {
        holderName: { type: String, required: true },
        holderType: { type: String, default: 'Founder' },
        shares: { type: Number, default: 0 },
        ownershipPercentage: { type: Number, default: 0 },
      },
    ],
    postTransactionOwnership: [
      {
        holderName: { type: String, required: true },
        holderType: { type: String, default: 'Investor' },
        shares: { type: Number, default: 0 },
        ownershipPercentage: { type: Number, default: 0 },
      },
    ],
    totalSharesBefore: {
      type: Number,
      required: true,
      min: 0,
    },
    totalSharesAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    investorOwnership: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    founderOwnership: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    otherOwnership: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    valuation: {
      type: Number,
      default: 0,
      min: 0,
    },
    sharePrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable snapshots
  }
);

capTableSnapshotSchema.index({ startup: 1, createdAt: -1 });

const CapTableSnapshot = mongoose.model('CapTableSnapshot', capTableSnapshotSchema);

module.exports = CapTableSnapshot;
