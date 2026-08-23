const mongoose = require('mongoose');

const investorInterestSchema = new mongoose.Schema(
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investor User ID is required'],
      index: true,
    },
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
    status: {
      type: String,
      enum: ['Interested', 'Contacted', 'Accepted', 'Declined', 'Withdrawn'],
      default: 'Interested',
      index: true,
    },
    message: {
      type: String,
      default: '',
      maxlength: [1000, 'Introductory note cannot exceed 1000 characters'],
      trim: true,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

investorInterestSchema.index({ investor: 1, startup: 1 }, { unique: true });
investorInterestSchema.index({ founder: 1, status: 1 });

const InvestorInterest = mongoose.model('InvestorInterest', investorInterestSchema);

module.exports = InvestorInterest;
