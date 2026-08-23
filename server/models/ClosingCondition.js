const mongoose = require('mongoose');
const { CONDITION_CATEGORIES, CONDITION_STATUSES } = require('../config/closingConstants');

const closingConditionSchema = new mongoose.Schema(
  {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClosingTransaction',
      required: [true, 'Closing Transaction ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Condition title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: CONDITION_CATEGORIES,
      default: 'Legal',
    },
    required: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: CONDITION_STATUSES,
      default: 'Pending',
      index: true,
    },
    responsibleParty: {
      type: String,
      enum: ['Founder', 'Investor', 'Legal Counsel', 'Mutual'],
      default: 'Mutual',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    completedBy: {
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

closingConditionSchema.index({ transaction: 1, required: 1, status: 1 });

const ClosingCondition = mongoose.model('ClosingCondition', closingConditionSchema);

module.exports = ClosingCondition;
