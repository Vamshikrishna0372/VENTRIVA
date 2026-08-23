const mongoose = require('mongoose');
const { PAYMENT_STATUSES } = require('../config/closingConstants');

const paymentRecordSchema = new mongoose.Schema(
  {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClosingTransaction',
      required: [true, 'Closing Transaction ID is required'],
      index: true,
    },
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investor User ID is required'],
      index: true,
    },
    expectedAmount: {
      type: Number,
      required: [true, 'Expected payment amount is required'],
      min: [0, 'Expected amount cannot be negative'],
    },
    receivedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Received amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
    },
    paymentMethod: {
      type: String,
      default: 'Wire Transfer / Escrow',
      trim: true,
    },
    paymentReference: {
      type: String,
      default: '',
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'Pending',
      index: true,
    },
    receivedAt: {
      type: Date,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

paymentRecordSchema.index({ transaction: 1, investor: 1 });

const PaymentRecord = mongoose.model('PaymentRecord', paymentRecordSchema);

module.exports = PaymentRecord;
