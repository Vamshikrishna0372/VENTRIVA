const mongoose = require('mongoose');
const { DOCUMENT_CATEGORIES, DOCUMENT_VISIBILITY, DOCUMENT_STATUSES } = require('../config/documentConstants');

const documentSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID is required'],
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploaded by User ID is required'],
      index: true,
    },
    category: {
      type: String,
      enum: {
        values: DOCUMENT_CATEGORIES,
        message: 'Invalid document category',
      },
      required: [true, 'Document category is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    originalFileName: {
      type: String,
      required: [true, 'Original file name is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size cannot be negative'],
    },
    storageProvider: {
      type: String,
      default: 'local',
    },
    storageKey: {
      type: String,
      required: [true, 'Storage key is required'],
    },
    version: {
      type: Number,
      default: 1,
      min: [1, 'Version number must be at least 1'],
    },
    visibility: {
      type: String,
      enum: {
        values: DOCUMENT_VISIBILITY,
        message: 'Invalid visibility level',
      },
      default: 'Investors Only',
      index: true,
    },
    allowedInvestors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: {
        values: DOCUMENT_STATUSES,
        message: 'Invalid document status',
      },
      default: 'Active',
      index: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    versions: [
      {
        versionNumber: { type: Number, required: true },
        fileUrl: { type: String, required: true },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    accessLogs: [
      {
        accessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        accessType: { type: String, default: 'View' },
        accessedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound indexes
documentSchema.index({ startup: 1, category: 1, status: 1 });
documentSchema.index({ startup: 1, visibility: 1 });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
