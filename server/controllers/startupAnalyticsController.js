const mongoose = require('mongoose');
const Startup = require('../models/Startup');

/**
 * @desc    Get startup trait analytics
 * @route   GET /api/analytics/startups/:startupId
 * @access  Private (Founder Owner / Authorized Investor / Admin)
 */
const getStartupAnalytics = async (req, res, next) => {
  try {
    const { startupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(startupId)) {
      return res.status(400).json({ success: false, message: 'Invalid Startup ObjectId format' });
    }

    const startup = await Startup.findById(startupId).lean();
    if (!startup || startup.isDeleted) {
      return res.status(404).json({ success: false, message: 'Startup profile not found' });
    }

    const isFounderOwner = req.user.role === 'founder' && startup.founder.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isInvestor = req.user.role === 'investor';

    if (!isFounderOwner && !isAdmin && !isInvestor) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to view startup analytics' });
    }

    const analytics = {
      startupName: startup.startupName,
      profileCompletion: startup.profileCompletion,
      stage: startup.stage,
      sector: startup.sector,
      businessModel: startup.businessModel,
      monthlyRevenue: startup.monthlyRevenue || 0,
      annualRevenue: startup.annualRevenue || 0,
      revenueGrowth: startup.revenueGrowth || 0,
      customerCount: startup.customerCount || 0,
      fundingRequired: startup.fundingRequired || 0,
      fundraisingStatus: startup.fundraisingStatus,
    };

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStartupAnalytics,
};
