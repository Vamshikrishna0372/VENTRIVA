const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
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
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Initiator User ID is required'],
    },
    subject: {
      type: String,
      default: 'Startup Opportunity Inquiry',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Archived', 'Blocked'],
      default: 'Active',
      index: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastMessageBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    unreadCountFounder: {
      type: Number,
      default: 0,
    },
    unreadCountInvestor: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// One active conversation per investor per startup
conversationSchema.index({ startup: 1, investor: 1 }, { unique: true });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
