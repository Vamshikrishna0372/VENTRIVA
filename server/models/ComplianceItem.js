const mongoose = require('mongoose');
const { COMPLIANCE_STATUSES, COMPLIANCE_PRIORITIES } = require('../config/governanceConstants');

const complianceItemSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID is required'],
      index: true,
    },
    category: {
      type: String,
      enum: [
        'Corporate',
        'Legal',
        'Financial',
        'Tax',
        'Tax & Financial',
        'Regulatory',
        'Investor Reporting',
        'Board Governance',
        'Shareholder',
        'Fundraising',
        'IP & Legal',
        'Other',
      ],
      default: 'Corporate',
    },
    title: {
      type: String,
      required: [true, 'Compliance item title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: COMPLIANCE_STATUSES,
      default: 'Pending',
      index: true,
    },
    priority: {
      type: String,
      enum: COMPLIANCE_PRIORITIES,
      default: 'Medium',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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
    recurrence: {
      type: String,
      enum: ['None', 'Monthly', 'Quarterly', 'Annual'],
      default: 'None',
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
    nextReviewDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

complianceItemSchema.index({ startup: 1, status: 1, dueDate: 1 });

const ComplianceItem = mongoose.model('ComplianceItem', complianceItemSchema);

module.exports = ComplianceItem;
