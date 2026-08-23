const mongoose = require('mongoose');

const shortlistSchema = new mongoose.Schema(
  {
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
      index: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: Prevents duplicate shortlist entries per investor
shortlistSchema.index({ investor: 1, startup: 1 }, { unique: true });

const Shortlist = mongoose.model('Shortlist', shortlistSchema);

module.exports = Shortlist;
