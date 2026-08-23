const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID is required'],
      index: true,
    },
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Founder User ID is required'],
      index: true,
    },
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investor User ID is required'],
      index: true,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    scheduledStart: {
      type: Date,
      required: [true, 'Scheduled start time is required'],
      index: true,
    },
    scheduledEnd: {
      type: Date,
      required: [true, 'Scheduled end time is required'],
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    meetingType: {
      type: String,
      enum: ['Video Call', 'Phone Call', 'In Person'],
      default: 'Video Call',
    },
    meetingLink: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Requested', 'Confirmed', 'Declined', 'Cancelled', 'Completed', 'No Show'],
      default: 'Requested',
      index: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requested by User ID is required'],
    },
    cancellationReason: {
      type: String,
      default: '',
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

meetingSchema.index({ founder: 1, scheduledStart: 1 });
meetingSchema.index({ investor: 1, scheduledStart: 1 });

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
