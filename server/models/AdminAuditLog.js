const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin User ID is required'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Audit action is required'],
      index: true,
    },
    targetType: {
      type: String,
      required: [true, 'Target type is required'],
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Audit description is required'],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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
    timestamps: { createdAt: true, updatedAt: false }, // Immutable append-only logs
  }
);

const AdminAuditLog = mongoose.model('AdminAuditLog', adminAuditLogSchema);

module.exports = AdminAuditLog;
