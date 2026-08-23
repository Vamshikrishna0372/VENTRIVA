const mongoose = require('mongoose');
const Startup = require('../models/Startup');
const TeamMember = require('../models/TeamMember');
const User = require('../models/User');
const { calculateProfileCompletion } = require('../services/profileCompletionService');

// Helper to verify startup ownership
const verifyStartupOwnership = async (startupId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(startupId)) {
    return { error: 'Invalid Startup ObjectId format', status: 400 };
  }

  const startup = await Startup.findById(startupId);
  if (!startup || startup.isDeleted) {
    return { error: 'Startup profile not found', status: 404 };
  }

  if (startup.founder.toString() !== userId.toString()) {
    return { error: 'Forbidden: You do not possess ownership authorization for this startup profile', status: 403 };
  }

  return { startup };
};

/**
 * @desc    Add team member to founder's startup
 * @route   POST /api/startups/my/:startupId/team
 * @access  Private (Founder)
 */
const addTeamMember = async (req, res, next) => {
  try {
    const { startupId } = req.params;
    const { name, role, bio, linkedin, yearsOfExperience, isFounder, displayOrder } = req.body;

    const { startup, error, status } = await verifyStartupOwnership(startupId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    if (!name || !name.trim() || !role || !role.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide team member name and role' });
    }

    const existingMember = await TeamMember.findOne({
      startup: startup._id,
      name: { $regex: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });

    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: 'A team member with this name already exists for this startup',
      });
    }

    const member = await TeamMember.create({
      startup: startup._id,
      name: name.trim(),
      role: role.trim(),
      bio: bio ? bio.trim() : '',
      linkedin: linkedin ? linkedin.trim() : '',
      yearsOfExperience: Number(yearsOfExperience) || 0,
      isFounder: Boolean(isFounder),
      displayOrder: Number(displayOrder) || 0,
    });

    // Update completion
    const teamMembersCount = await TeamMember.countDocuments({ startup: startup._id });
    const founderUser = await User.findById(req.user._id);
    const { percentage } = calculateProfileCompletion(startup, founderUser, teamMembersCount);

    startup.profileCompletion = percentage;
    await startup.save();

    res.status(201).json({
      success: true,
      message: 'Team member added successfully',
      member,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get team members for founder's startup
 * @route   GET /api/startups/my/:startupId/team
 * @access  Private (Founder)
 */
const getTeamMembers = async (req, res, next) => {
  try {
    const { startupId } = req.params;

    const { startup, error, status } = await verifyStartupOwnership(startupId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    const teamMembers = await TeamMember.find({ startup: startup._id }).sort({ displayOrder: 1, createdAt: 1 });
    res.status(200).json({ success: true, teamMembers });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update team member
 * @route   PUT /api/startups/my/:startupId/team/:memberId
 * @access  Private (Founder)
 */
const updateTeamMember = async (req, res, next) => {
  try {
    const { startupId, memberId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ success: false, message: 'Invalid TeamMember ObjectId format' });
    }

    const { startup, error, status } = await verifyStartupOwnership(startupId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    const member = await TeamMember.findById(memberId);
    if (!member || member.startup.toString() !== startup._id.toString()) {
      return res.status(404).json({ success: false, message: 'Team member record not found for this startup' });
    }

    const { name, role, bio, linkedin, yearsOfExperience, isFounder, displayOrder } = req.body;

    if (name) member.name = name.trim();
    if (role) member.role = role.trim();
    if (bio !== undefined) member.bio = bio.trim();
    if (linkedin !== undefined) member.linkedin = linkedin.trim();
    if (yearsOfExperience !== undefined) member.yearsOfExperience = Number(yearsOfExperience) || 0;
    if (isFounder !== undefined) member.isFounder = Boolean(isFounder);
    if (displayOrder !== undefined) member.displayOrder = Number(displayOrder) || 0;

    await member.save();

    res.status(200).json({
      success: true,
      message: 'Team member updated successfully',
      member,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete team member
 * @route   DELETE /api/startups/my/:startupId/team/:memberId
 * @access  Private (Founder)
 */
const deleteTeamMember = async (req, res, next) => {
  try {
    const { startupId, memberId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ success: false, message: 'Invalid TeamMember ObjectId format' });
    }

    const { startup, error, status } = await verifyStartupOwnership(startupId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    const member = await TeamMember.findById(memberId);
    if (!member || member.startup.toString() !== startup._id.toString()) {
      return res.status(404).json({ success: false, message: 'Team member record not found for this startup' });
    }

    await TeamMember.deleteOne({ _id: member._id });

    // Update completion
    const teamMembersCount = await TeamMember.countDocuments({ startup: startup._id });
    const founderUser = await User.findById(req.user._id);
    const { percentage } = calculateProfileCompletion(startup, founderUser, teamMembersCount);

    startup.profileCompletion = percentage;
    await startup.save();

    res.status(200).json({
      success: true,
      message: 'Team member removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTeamMember,
  getTeamMembers,
  updateTeamMember,
  deleteTeamMember,
};
