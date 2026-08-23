const mongoose = require('mongoose');
const User = require('../models/User');
const Startup = require('../models/Startup');
const Evaluation = require('../models/Evaluation');
const PipelineEntry = require('../models/PipelineEntry');
const ModerationFlag = require('../models/ModerationFlag');
const AdminAuditLog = require('../models/AdminAuditLog');
const { calculateProfileCompletion } = require('../services/profileCompletionService');

// Helper to record administrative audit log
const logAdminAction = async (adminId, action, targetType, targetId, description, metadata = {}, req = null) => {
  try {
    await AdminAuditLog.create({
      admin: adminId,
      action,
      targetType,
      targetId: targetId || null,
      description,
      metadata,
      ipAddress: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') : '',
      userAgent: req ? (req.headers['user-agent'] || '') : '',
    });
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }
};

/**
 * @desc    Get Admin Dashboard KPI metrics & recent activity
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
const getAdminDashboardMetrics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      founderCount,
      investorCount,
      activeUsers,
      suspendedUsers,
      totalStartups,
      publishedStartups,
      draftStartups,
      verifiedStartups,
      pendingVerificationStartups,
      totalEvaluations,
      activePipelineCount,
      pipelineAgg,
      openFlagsCount,
      recentAuditLogs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'founder' }),
      User.countDocuments({ role: 'investor' }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      Startup.countDocuments({ isDeleted: false }),
      Startup.countDocuments({ isDeleted: false, isPublished: true }),
      Startup.countDocuments({ isDeleted: false, isPublished: false }),
      Startup.countDocuments({ isDeleted: false, isVerified: true }),
      Startup.countDocuments({ isDeleted: false, isVerified: false, isPublished: true }),
      Evaluation.countDocuments(),
      PipelineEntry.countDocuments({ status: 'Active' }),
      PipelineEntry.aggregate([{ $match: { status: 'Active' } }, { $group: { _id: null, totalVal: { $sum: '$expectedInvestment' } } }]),
      ModerationFlag.countDocuments({ status: 'Open' }),
      AdminAuditLog.find().populate('admin', 'name email').sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    const totalPipelineValue = pipelineAgg.length > 0 ? pipelineAgg[0].totalVal : 0;

    res.status(200).json({
      success: true,
      metrics: {
        users: {
          total: totalUsers,
          founders: founderCount,
          investors: investorCount,
          active: activeUsers,
          suspended: suspendedUsers,
        },
        startups: {
          total: totalStartups,
          published: publishedStartups,
          draft: draftStartups,
          verified: verifiedStartups,
          pendingVerification: pendingVerificationStartups,
        },
        investorActivity: {
          evaluations: totalEvaluations,
          activePipelines: activePipelineCount,
          totalPipelineValue,
        },
        moderation: {
          openFlags: openFlagsCount,
        },
        recentAuditLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated users list with search & filters
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getAdminUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search, role, status, verification, sortBy } = req.query;

    const query = {};
    if (role && role !== 'all') query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'suspended') query.isActive = false;
    if (verification === 'verified') query.isVerified = true;
    if (verification === 'unverified') query.isVerified = false;

    if (search && search.trim().length > 0) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }];
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'oldest') sortOption = { createdAt: 1 };
    if (sortBy === 'name') sortOption = { name: 1 };

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort(sortOption).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user details by ID
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin)
 */
const getAdminUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid User ObjectId format' });
    }

    const user = await User.findById(id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    let founderStartup = null;
    if (user.role === 'founder') {
      founderStartup = await Startup.findOne({ founder: user._id, isDeleted: false }).lean();
      if (founderStartup) {
        const comp = calculateProfileCompletion(founderStartup);
        founderStartup.profileCompletion = comp.totalCompletionPercentage;
      }
    }

    res.status(200).json({
      success: true,
      user,
      founderStartup,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user account active/suspended status
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private (Admin)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid User ObjectId format' });
    }

    if (id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Admins cannot suspend or deactivate their own admin account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    user.isActive = Boolean(isActive);
    await user.save();

    const action = user.isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED';
    await logAdminAction(
      req.user._id,
      action,
      'User',
      user._id,
      `${action === 'USER_SUSPENDED' ? 'Suspended' : 'Activated'} user account ${user.email}`,
      { reason: reason || 'Admin status toggle' },
      req
    );

    res.status(200).json({
      success: true,
      message: `User account ${user.isActive ? 'activated' : 'suspended'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user verification status
 * @route   PATCH /api/admin/users/:id/verification
 * @access  Private (Admin)
 */
const updateUserVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid User ObjectId format' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    user.isVerified = Boolean(isVerified);
    await user.save();

    const action = user.isVerified ? 'USER_VERIFIED' : 'USER_UNVERIFIED';
    await logAdminAction(
      req.user._id,
      action,
      'User',
      user._id,
      `${user.isVerified ? 'Verified' : 'Unverified'} user account ${user.email}`,
      {},
      req
    );

    res.status(200).json({
      success: true,
      message: `User verification updated to ${user.isVerified}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated startups list for admin control
 * @route   GET /api/admin/startups
 * @access  Private (Admin)
 */
const getAdminStartups = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search, sector, stage, verificationStatus, isPublished, isVerified } = req.query;

    const query = { isDeleted: false };
    if (sector && sector !== 'all') query.sector = sector;
    if (stage && stage !== 'all') query.stage = stage;
    if (verificationStatus && verificationStatus !== 'all') query.verificationStatus = verificationStatus;
    if (isPublished === 'true') query.isPublished = true;
    if (isPublished === 'false') query.isPublished = false;
    if (isVerified === 'true') query.isVerified = true;
    if (isVerified === 'false') query.isVerified = false;

    if (search && search.trim().length > 0) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ startupName: regex }, { sector: regex }, { tagline: regex }];
    }

    const [startups, total] = await Promise.all([
      Startup.find(query)
        .populate('founder', 'name email isVerified isActive')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Startup.countDocuments(query),
    ]);

    const startupsWithCompletion = startups.map((s) => ({
      ...s,
      profileCompletion: calculateProfileCompletion(s).totalCompletionPercentage,
    }));

    res.status(200).json({
      success: true,
      count: startupsWithCompletion.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      startups: startupsWithCompletion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get startup detail by ID for admin
 * @route   GET /api/admin/startups/:id
 * @access  Private (Admin)
 */
const getAdminStartupById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Startup ObjectId format' });
    }

    const startup = await Startup.findById(id).populate('founder', 'name email isVerified isActive').lean();
    if (!startup || startup.isDeleted) {
      return res.status(404).json({ success: false, message: 'Startup profile not found' });
    }

    const comp = calculateProfileCompletion(startup);

    res.status(200).json({
      success: true,
      startup,
      profileCompletion: comp,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update startup verification decision (Approve, Reject with reason)
 * @route   PATCH /api/admin/startups/:id/verification
 * @access  Private (Admin)
 */
const updateStartupVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verificationStatus, reason } = req.body;

    if (!['Verified', 'Rejected', 'Pending Review', 'Unverified'].includes(verificationStatus)) {
      return res.status(400).json({ success: false, message: `Invalid verification status: ${verificationStatus}` });
    }

    if (verificationStatus === 'Rejected' && (!reason || reason.trim().length === 0)) {
      return res.status(400).json({ success: false, message: 'A rejection reason is required when rejecting verification' });
    }

    const startup = await Startup.findById(id);
    if (!startup || startup.isDeleted) {
      return res.status(404).json({ success: false, message: 'Startup profile not found' });
    }

    startup.verificationStatus = verificationStatus;
    startup.isVerified = verificationStatus === 'Verified';
    startup.verifiedBy = req.user._id;
    startup.verifiedAt = new Date();
    if (reason) startup.verificationReason = reason.trim();

    await startup.save();

    const action = verificationStatus === 'Verified' ? 'STARTUP_VERIFIED' : 'STARTUP_REJECTED';
    await logAdminAction(
      req.user._id,
      action,
      'Startup',
      startup._id,
      `${action === 'STARTUP_VERIFIED' ? 'Verified' : 'Rejected'} startup ${startup.startupName}`,
      { status: verificationStatus, reason: reason || '' },
      req
    );

    res.status(200).json({
      success: true,
      message: `Startup verification status updated to ${verificationStatus}`,
      startup,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update startup publication governance state
 * @route   PATCH /api/admin/startups/:id/publication
 * @access  Private (Admin)
 */
const updateStartupPublication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isPublished, profileVisibility, reason } = req.body;

    const startup = await Startup.findById(id);
    if (!startup || startup.isDeleted) {
      return res.status(404).json({ success: false, message: 'Startup profile not found' });
    }

    if (isPublished !== undefined) startup.isPublished = Boolean(isPublished);
    if (profileVisibility) startup.profileVisibility = profileVisibility;

    await startup.save();

    const action = startup.isPublished ? 'STARTUP_PUBLISHED' : 'STARTUP_SUSPENDED';
    await logAdminAction(
      req.user._id,
      action,
      'Startup',
      startup._id,
      `${action === 'STARTUP_PUBLISHED' ? 'Published' : 'Suspended/Unpublished'} startup ${startup.startupName}`,
      { isPublished: startup.isPublished, profileVisibility: startup.profileVisibility, reason: reason || '' },
      req
    );

    res.status(200).json({
      success: true,
      message: `Startup publication state updated successfully`,
      startup,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a content/user moderation flag (Public authenticated endpoint)
 * @route   POST /api/admin/flags
 * @access  Private (Founder/Investor/Admin)
 */
const createModerationFlag = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    if (!['startup', 'founder', 'investor'].includes(targetType)) {
      return res.status(400).json({ success: false, message: 'Invalid flag target type' });
    }
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ success: false, message: 'Invalid target ObjectId format' });
    }
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Flag reason is required' });
    }

    const flag = await ModerationFlag.create({
      reportedBy: req.user._id,
      reportedRole: req.user.role,
      targetType,
      targetId,
      reason: reason.trim(),
      description: description ? description.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted to platform moderation team',
      flag,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated moderation flags list
 * @route   GET /api/admin/flags
 * @access  Private (Admin)
 */
const getModerationFlags = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { status, priority, targetType } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (targetType && targetType !== 'all') query.targetType = targetType;

    const [flags, total] = await Promise.all([
      ModerationFlag.find(query)
        .populate('reportedBy', 'name email role')
        .populate('assignedAdmin', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ModerationFlag.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: flags.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      flags,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update moderation flag status & resolution note
 * @route   PATCH /api/admin/flags/:id
 * @access  Private (Admin)
 */
const updateModerationFlag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority, resolutionNote } = req.body;

    const flag = await ModerationFlag.findById(id);
    if (!flag) {
      return res.status(404).json({ success: false, message: 'Moderation flag not found' });
    }

    if (status) flag.status = status;
    if (priority) flag.priority = priority;
    if (resolutionNote !== undefined) flag.resolutionNote = resolutionNote.trim();
    flag.assignedAdmin = req.user._id;

    await flag.save();

    await logAdminAction(
      req.user._id,
      'FLAG_RESOLVED',
      'ModerationFlag',
      flag._id,
      `Updated moderation flag ${flag._id} status to ${flag.status}`,
      { status: flag.status, priority: flag.priority },
      req
    );

    res.status(200).json({
      success: true,
      message: 'Moderation flag updated successfully',
      flag,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated administrative audit logs
 * @route   GET /api/admin/audit-logs
 * @access  Private (Admin)
 */
const getAdminAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const { action, targetType, search } = req.query;

    const query = {};
    if (action && action !== 'all') query.action = action;
    if (targetType && targetType !== 'all') query.targetType = targetType;

    if (search && search.trim().length > 0) {
      const regex = new RegExp(search.trim(), 'i');
      query.description = regex;
    }

    const [logs, total] = await Promise.all([
      AdminAuditLog.find(query)
        .populate('admin', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdminAuditLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: logs.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated platform analytics
 * @route   GET /api/admin/analytics
 * @access  Private (Admin)
 */
const getAdminAnalytics = async (req, res, next) => {
  try {
    const [
      sectorBreakdown,
      stageBreakdown,
      verificationStats,
      userRoleDistribution,
    ] = await Promise.all([
      Startup.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: '$sector', count: { $sum: 1 } } }]),
      Startup.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: '$stage', count: { $sum: 1 } } }]),
      Startup.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: '$verificationStatus', count: { $sum: 1 } } }]),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        sectorBreakdown,
        stageBreakdown,
        verificationStats,
        userRoleDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboardMetrics,
  getAdminUsers,
  getAdminUserById,
  updateUserStatus,
  updateUserVerification,
  getAdminStartups,
  getAdminStartupById,
  updateStartupVerification,
  updateStartupPublication,
  createModerationFlag,
  getModerationFlags,
  updateModerationFlag,
  getAdminAuditLogs,
  getAdminAnalytics,
};
