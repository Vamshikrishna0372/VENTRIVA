const mongoose = require('mongoose');
const { VOTE_VALUES } = require('../config/governanceConstants');

const governanceVoteSchema = new mongoose.Schema(
  {
    resolution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BoardResolution',
      required: [true, 'Board Resolution ID is required'],
      index: true,
    },
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID is required'],
      index: true,
    },
    voter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Voter User ID is required'],
      index: true,
    },
    voterType: {
      type: String,
      enum: ['Director', 'Shareholder'],
      default: 'Director',
    },
    vote: {
      type: String,
      enum: VOTE_VALUES,
      required: [true, 'Vote value is required'],
    },
    votingPower: {
      type: Number,
      required: [true, 'Voting power is required'],
      min: [0, 'Voting power cannot be negative'],
    },
    castAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Recorded', 'Cancelled'],
      default: 'Recorded',
    },
    comment: {
      type: String,
      default: '',
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: One vote per voter per resolution
governanceVoteSchema.index({ resolution: 1, voter: 1 }, { unique: true });

const GovernanceVote = mongoose.model('GovernanceVote', governanceVoteSchema);

module.exports = GovernanceVote;
