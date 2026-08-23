const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Team member name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      required: [true, 'Team member role/title is required'],
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters'],
    },
    bio: {
      type: String,
      default: '',
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    linkedin: {
      type: String,
      default: '',
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
      min: [0, 'Years of experience cannot be negative'],
    },
    isFounder: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

teamMemberSchema.index({ startup: 1, displayOrder: 1 });

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

module.exports = TeamMember;
