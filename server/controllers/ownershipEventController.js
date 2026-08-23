const OwnershipEvent = require('../models/OwnershipEvent');
const Investment = require('../models/Investment');

/**
 * @desc    Get ownership history timeline for an investment
 * @route   GET /api/ownership-events/investment/:investmentId
 * @access  Private (Participants + Admin)
 */
const getOwnershipHistory = async (req, res, next) => {
  try {
    const { investmentId } = req.params;
    const investment = await Investment.findById(investmentId);

    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment record not found' });
    }

    const isInvestor = investment.investor.toString() === req.user._id.toString();
    const isFounder = investment.founder.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isInvestor && !isFounder && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view ownership history' });
    }

    const events = await OwnershipEvent.find({ investment: investmentId })
      .sort({ effectiveDate: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOwnershipHistory,
};
