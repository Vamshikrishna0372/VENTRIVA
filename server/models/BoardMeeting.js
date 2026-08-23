const mongoose = require('mongoose');
const { MEETING_STATUSES, MEETING_TYPES } = require('../config/governanceConstants');

const boardMeetingSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    meetingType: {
      type: String,
      enum: MEETING_TYPES,
      default: 'Regular',
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
      index: true,
    },
    startTime: {
      type: String,
      default: '10:00 AM',
    },
    endTime: {
      type: String,
      default: '11:30 AM',
    },
    location: {
      type: String,
      default: 'Virtual Video Conference',
    },
    meetingLink: {
      type: String,
      default: '',
    },
    agenda: [
      {
        itemNumber: { type: Number, required: true },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        presenter: { type: String, default: 'Founder' },
        allocatedMinutes: { type: Number, default: 15 },
      },
    ],
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, default: 'Director' },
        attended: { type: Boolean, default: false },
      },
    ],
    status: {
      type: String,
      enum: MEETING_STATUSES,
      default: 'Scheduled',
      index: true,
    },
    quorumRequired: {
      type: Number,
      default: 50, // 50% majority quorum
    },
    quorumReached: {
      type: Boolean,
      default: false,
    },
    minutes: {
      type: String,
      default: '',
    },
    attachments: [
      {
        documentName: { type: String, required: true },
        documentUrl: { type: String, default: '' },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

boardMeetingSchema.index({ startup: 1, scheduledDate: -1 });

const BoardMeeting = mongoose.model('BoardMeeting', boardMeetingSchema);

module.exports = BoardMeeting;
