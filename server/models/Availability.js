const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Founder User ID is required'],
      index: true,
    },
    dayOfWeek: {
      type: Number,
      required: [true, 'Day of week is required (0 = Sun, 1 = Mon ... 6 = Sat)'],
      min: 0,
      max: 6,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required (HH:MM format)'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please enter valid HH:MM start time'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required (HH:MM format)'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please enter valid HH:MM end time'],
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

availabilitySchema.index({ founder: 1, dayOfWeek: 1 });

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;
