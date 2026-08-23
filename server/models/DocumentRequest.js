const mongoose = require('mongoose');

const documentRequestSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID is required'],
      index: true,
    },
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investor ID is required'],
      index: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requested by User ID is required'],
    },
    category: {
      type: String,
      required: [true, 'Document category is required'],
    },
    title: {
      type: String,
      required: [true, 'Request title is required'],
    },
    description: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Requested', 'In Progress', 'Provided', 'Rejected', 'Cancelled'],
      default: 'Requested',
      index: true,
    },
    responseDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    founderResponse: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

documentRequestSchema.index({ startup: 1, investor: 1, status: 1 });

const DocumentRequest = mongoose.model('DocumentRequest', documentRequestSchema);

module.exports = DocumentRequest;
