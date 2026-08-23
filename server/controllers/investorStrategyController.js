const InvestorStrategy = require('../models/InvestorStrategy');

/**
 * @desc    Get active investor strategy profile
 * @route   GET /api/investor-strategy
 * @access  Private (Investor only)
 */
const getMyStrategy = async (req, res, next) => {
  try {
    let strategy = await InvestorStrategy.findOne({ investor: req.user._id, active: true });
    if (!strategy) {
      strategy = await InvestorStrategy.create({
        investor: req.user._id,
        strategyName: 'Core Venture Mandate',
        targetCapitalDeployment: 5000000,
        targetInitialCheckSize: 250000,
        targetFollowOnReserve: 40,
        active: true,
      });
    }

    res.status(200).json({
      success: true,
      data: strategy,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update investor strategy mandate
 * @route   POST /api/investor-strategy
 * @access  Private (Investor only)
 */
const saveStrategy = async (req, res, next) => {
  try {
    const { strategyName, targetCapitalDeployment, targetInitialCheckSize, targetFollowOnReserve } = req.body;

    const strategy = await InvestorStrategy.findOneAndUpdate(
      { investor: req.user._id, active: true },
      {
        investor: req.user._id,
        strategyName: strategyName || 'Core Venture Mandate',
        targetCapitalDeployment: targetCapitalDeployment || 5000000,
        targetInitialCheckSize: targetInitialCheckSize || 250000,
        targetFollowOnReserve: targetFollowOnReserve || 40,
        active: true,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Investor strategy mandate updated successfully',
      data: strategy,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyStrategy,
  saveStrategy,
};
