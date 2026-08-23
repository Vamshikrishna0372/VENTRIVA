const mongoose = require('mongoose');

const followOnInvestmentSchema = new mongoose.Schema(
  {
    investment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investment',
      required: [true, 'Investment ID is required'],
      index: true,
    },
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
    },
    amount: {
      type: Number,
      required: [true, 'Follow-on investment amount is required'],
      min: [0, 'Follow-on amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
    },
    investmentDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    reason: {
      type: String,
      default: 'Pro-rata Participation',
    },
    round: {
      type: String,
      default: 'Series A',
    },
    ownershipBefore: {
      type: Number,
      default: 0,
    },
    ownershipAfter: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Committed', 'Completed', 'Cancelled'],
      default: 'Completed',
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

followOnInvestmentSchema.index({ investment: 1, investmentDate: -1 });

const FollowOnInvestment = mongoose.model('FollowOnInvestment', followOnInvestmentSchema);

module.exports = FollowOnInvestment;
