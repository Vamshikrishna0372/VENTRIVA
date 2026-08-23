const CapitalAllocationPlan = require('../models/CapitalAllocationPlan');
const { calculateCapitalDeploymentStats } = require('../services/capitalDeploymentService');

/**
 * @desc    Create or update capital allocation plan
 * @route   POST /api/capital-allocations
 * @access  Private (Investor only)
 */
const saveAllocationPlan = async (req, res, next) => {
  try {
    const { planningPeriod, totalAvailableCapital, proposedAllocations } = req.body;

    const stats = await calculateCapitalDeploymentStats(req.user._id);

    const totalProposed = (proposedAllocations || []).reduce((acc, p) => acc + (p.proposedAmount || 0), 0);
    const availableCap = totalAvailableCapital || stats.totalAvailableCapital;

    if (totalProposed > availableCap) {
      return res.status(400).json({
        success: false,
        message: `Proposed allocations ($${totalProposed.toLocaleString()}) exceed available capital ($${availableCap.toLocaleString()})`,
      });
    }

    const plan = await CapitalAllocationPlan.create({
      investor: req.user._id,
      planningPeriod: planningPeriod || 'Q3-Q4 2026',
      totalAvailableCapital: availableCap,
      alreadyDeployedCapital: stats.alreadyDeployedCapital,
      reservedFollowOnCapital: stats.reservedFollowOnCapital,
      availableForNewInvestments: stats.availableForNewInvestments,
      proposedAllocations: proposedAllocations || [],
      totalProposedCapital: totalProposed,
      remainingCapital: availableCap - stats.alreadyDeployedCapital - totalProposed,
      status: 'Approved',
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Capital allocation plan created and approved',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get capital allocation plans
 * @route   GET /api/capital-allocations
 * @access  Private (Investor only)
 */
const getAllocationPlans = async (req, res, next) => {
  try {
    const plans = await CapitalAllocationPlan.find({ investor: req.user._id })
      .populate('proposedAllocations.startup', 'startupName sector stage logo')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveAllocationPlan,
  getAllocationPlans,
};
