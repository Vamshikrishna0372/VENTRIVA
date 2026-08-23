const mongoose = require('mongoose');

const moderationFlagSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reported by User ID is required'],
      index: true,
    },
    reportedRole: {
      type: String,
      enum: ['founder', 'investor', 'admin'],
      default: 'investor',
    },
    targetType: {
      type: String,
      enum: {
        values: ['startup', 'founder', 'investor'],
        message: 'Invalid flag target type',
      },
      required: [true, 'Target type is required'],
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target ID is required'],
      index: true,
    },
    reason: {
      type: String,
      required: [true, 'Flag reason is required'],
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['Open', 'Under Review', 'Resolved', 'Dismissed'],
        message: 'Invalid flag status',
      },
      default: 'Open',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High', 'Critical'],
        message: 'Invalid flag priority',
      },
      default: 'Medium',
      index: true,
    },
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNote: {
      type: String,
      default: '',
      maxlength: [2000, 'Resolution note cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

const ModerationFlag = mongoose.model('ModerationFlag', moderationFlagSchema);

module.exports = ModerationFlag;
