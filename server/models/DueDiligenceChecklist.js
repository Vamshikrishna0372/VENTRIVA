const mongoose = require('mongoose');

const checkItemSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Complete', 'Blocked', 'Not Applicable'],
    default: 'Not Started',
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    default: null,
  },
  investorNote: {
    type: String,
    default: '',
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

const dueDiligenceChecklistSchema = new mongoose.Schema(
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
    items: [checkItemSchema],
    overallStatus: {
      type: String,
      enum: ['In Progress', 'Complete', 'Blocked'],
      default: 'In Progress',
    },
  },
  {
    timestamps: true,
  }
);

dueDiligenceChecklistSchema.index({ startup: 1, investor: 1 }, { unique: true });

const DueDiligenceChecklist = mongoose.model('DueDiligenceChecklist', dueDiligenceChecklistSchema);

module.exports = DueDiligenceChecklist;
