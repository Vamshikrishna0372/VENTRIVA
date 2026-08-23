const ExitEvent = require('../models/ExitEvent');
const Investment = require('../models/Investment');
const OwnershipEvent = require('../models/OwnershipEvent');
const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Propose or record an exit transaction
 * @route   POST /api/exits
 * @access  Private (Investor only)
 */
const createExitTransaction = async (req, res, next) => {
  try {
    const { investmentId, exitType, exitValue, buyerName, notes } = req.body;

    const investment = await Investment.findById(investmentId);
    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment record not found' });
    }

    if (investment.investor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to record exit transaction' });
    }

    if (exitValue < 0) {
      return res.status(400).json({ success: false, message: 'Exit value cannot be negative' });
    }

    const totalInvested = investment.totalInvested || investment.investmentAmount || 1;
    const realizedMultiple = totalInvested > 0 ? Number((exitValue / totalInvested).toFixed(2)) : 1.0;
    const realizedGain = exitValue - totalInvested;

    const exit = await ExitEvent.create({
      investment: investmentId,
      startup: investment.startup,
      investor: req.user._id,
      exitType,
      exitStatus: 'Planned',
      exitValue,
      realizedGain,
      realizedMultiple,
      buyerName: buyerName || '',
      notes: notes || '',
      createdBy: req.user._id,
    });

    await ActivityLog.create({
      activityType: 'portfolio',
      investment: investmentId,
      startup: investment.startup,
      actor: req.user._id,
      action: 'EXIT_PROPOSED',
      description: `Exit event proposed (${exitType}): expected value $${exitValue.toLocaleString()}`,
    });

    res.status(201).json({
      success: true,
      message: 'Exit transaction proposed successfully',
      data: exit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get exit transactions
 * @route   GET /api/exits
 * @access  Private
 */
const getExitTransactions = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'investor') {
      query.investor = req.user._id;
    }

    const exits = await ExitEvent.find(query)
      .populate('investment')
      .populate('startup', 'startupName sector logo')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: exits.length,
      data: exits,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete an exit transaction
 * @route   POST /api/exits/:id/complete
 * @access  Private (Investor only)
 */
const completeExitTransaction = async (req, res, next) => {
  try {
    const exit = await ExitEvent.findById(req.params.id);

    if (!exit) {
      return res.status(404).json({ success: false, message: 'Exit transaction record not found' });
    }

    if (exit.exitStatus === 'Completed') {
      return res.status(400).json({ success: false, message: 'Exit transaction is already completed' });
    }

    if (exit.investor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to complete this exit' });
    }

    const investment = await Investment.findById(exit.investment);
    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment record not found' });
    }

    // Update Exit state
    exit.exitStatus = 'Completed';
    exit.completedDate = new Date();
    await exit.save();

    // Update Investment holding
    investment.investmentStatus = exit.exitType === 'Write-Off' ? 'Written Off' : 'Exited';
    investment.realizedValue = exit.exitValue;
    investment.currentValue = 0;
    investment.returnMultiple = exit.realizedMultiple;
    investment.exitType = exit.exitType;
    investment.exitDate = new Date();
    investment.exitValue = exit.exitValue;
    const oldOwnership = investment.ownershipPercentage;
    investment.ownershipPercentage = 0;
    await investment.save();

    // Log Ownership Event
    await OwnershipEvent.create({
      investment: investment._id,
      startup: investment.startup,
      investor: req.user._id,
      eventType: 'Full Exit',
      previousOwnership: oldOwnership,
      newOwnership: 0,
      dilutionPercentage: oldOwnership,
      reason: `Full exit completed (${exit.exitType})`,
      createdBy: req.user._id,
    });

    // Log Activity
    await ActivityLog.create({
      activityType: 'portfolio',
      investment: investment._id,
      startup: investment.startup,
      actor: req.user._id,
      action: 'EXIT_COMPLETED',
      description: `Exit completed (${exit.exitType}): $${exit.exitValue.toLocaleString()} realized value (${exit.realizedMultiple}x MOIC)`,
    });

    res.status(200).json({
      success: true,
      message: 'Exit transaction completed and holding updated successfully',
      data: exit,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExitTransaction,
  getExitTransactions,
  completeExitTransaction,
};
