const InvestorStrategy = require('../models/InvestorStrategy');
const User = require('../models/User');

/**
 * @desc    Get active investor strategy profile
 * @route   GET /api/investor-strategy
 * @access  Private (Investor only)
 */
const getMyStrategy = async (req, res, next) => {
  try {
    let strategy = await InvestorStrategy.findOne({ investor: req.user._id, active: true }).lean();
    const user = await User.findById(req.user._id).lean();

    if (!strategy) {
      const created = await InvestorStrategy.create({
        investor: req.user._id,
        strategyName: 'Core Venture Allocation Strategy',
        targetCapitalDeployment: 5000000,
        targetInitialCheckSize: 250000,
        targetFollowOnReserve: 40,
        targetOwnershipRange: { min: 5, max: 20 },
        targetReturnMultiple: 3.0,
        active: true,
      });
      strategy = created.toObject();
    }

    // Merge User preference fields into strategy response if present
    if (user) {
      strategy.preferredSectors = user.preferredSectors || [];
      strategy.preferredStages = user.preferredStages || [];
      strategy.preferredBusinessModels = user.preferredBusinessModels || [];
      strategy.preferredGeographies = user.preferredGeographies || [];
      strategy.minimumInvestment = user.minimumInvestment || 0;
      strategy.maximumInvestment = user.maximumInvestment || 0;
      strategy.investmentCurrency = user.investmentCurrency || 'USD';
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
    const {
      strategyName,
      description,
      targetCapitalDeployment,
      targetInitialCheckSize,
      targetFollowOnReserve,
      targetOwnershipMin,
      targetOwnershipMax,
      targetReturnMultiple,
      preferredSectors,
      preferredStages,
      preferredBusinessModels,
      preferredGeographies,
      minimumInvestment,
      maximumInvestment,
      investmentCurrency,
    } = req.body;

    const capital = Number(targetCapitalDeployment);
    const checkSize = Number(targetInitialCheckSize);
    const reserve = Number(targetFollowOnReserve);
    const ownMin = Number(targetOwnershipMin);
    const ownMax = Number(targetOwnershipMax);
    const returnMultiple = Number(targetReturnMultiple);

    if (capital !== undefined && !isNaN(capital) && capital <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target Capital Deployment must be greater than $0',
      });
    }

    if (checkSize !== undefined && !isNaN(checkSize) && checkSize <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target Check Size must be greater than $0',
      });
    }

    if (capital !== undefined && checkSize !== undefined && !isNaN(capital) && !isNaN(checkSize) && checkSize > capital) {
      return res.status(400).json({
        success: false,
        message: 'Target Check Size cannot exceed total Target Capital Deployment',
      });
    }

    if (reserve !== undefined && !isNaN(reserve) && (reserve < 0 || reserve > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Follow-On Reserve Target must be between 0% and 100%',
      });
    }

    if (ownMin !== undefined && ownMax !== undefined && !isNaN(ownMin) && !isNaN(ownMax) && (ownMin < 0 || ownMax > 100 || ownMin > ownMax)) {
      return res.status(400).json({
        success: false,
        message: 'Target Ownership Range minimum cannot exceed maximum, and both must be between 0% and 100%',
      });
    }

    if (returnMultiple !== undefined && !isNaN(returnMultiple) && returnMultiple <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target Return Multiple must be greater than 0x MOIC',
      });
    }

    const updateFields = {
      investor: req.user._id,
      active: true,
    };

    if (strategyName) updateFields.strategyName = strategyName.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (capital) updateFields.targetCapitalDeployment = capital;
    if (checkSize) updateFields.targetInitialCheckSize = checkSize;
    if (reserve !== undefined) updateFields.targetFollowOnReserve = reserve;
    if (ownMin !== undefined && ownMax !== undefined) {
      updateFields.targetOwnershipRange = { min: ownMin, max: ownMax };
    }
    if (returnMultiple) updateFields.targetReturnMultiple = returnMultiple;

    if (Array.isArray(preferredSectors)) {
      updateFields.targetSectorAllocations = preferredSectors.map((s) => ({
        sector: s,
        percentage: Math.round(100 / (preferredSectors.length || 1)),
      }));
    }

    if (Array.isArray(preferredStages)) {
      updateFields.targetStageAllocations = preferredStages.map((st) => ({
        stage: st,
        percentage: Math.round(100 / (preferredStages.length || 1)),
      }));
    }

    const strategy = await InvestorStrategy.findOneAndUpdate(
      { investor: req.user._id, active: true },
      updateFields,
      { new: true, upsert: true, runValidators: true }
    );

    // Synchronize User profile preference fields in MongoDB
    const userUpdate = {};
    if (Array.isArray(preferredSectors)) userUpdate.preferredSectors = preferredSectors;
    if (Array.isArray(preferredStages)) userUpdate.preferredStages = preferredStages;
    if (Array.isArray(preferredBusinessModels)) userUpdate.preferredBusinessModels = preferredBusinessModels;
    if (Array.isArray(preferredGeographies)) userUpdate.preferredGeographies = preferredGeographies;
    if (minimumInvestment !== undefined) userUpdate.minimumInvestment = Number(minimumInvestment) || 0;
    if (maximumInvestment !== undefined) userUpdate.maximumInvestment = Number(maximumInvestment) || 0;
    if (investmentCurrency !== undefined) userUpdate.investmentCurrency = investmentCurrency;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdate);
    }

    const mergedData = strategy.toObject();
    const updatedUser = await User.findById(req.user._id).lean();
    if (updatedUser) {
      mergedData.preferredSectors = updatedUser.preferredSectors || [];
      mergedData.preferredStages = updatedUser.preferredStages || [];
      mergedData.preferredBusinessModels = updatedUser.preferredBusinessModels || [];
      mergedData.preferredGeographies = updatedUser.preferredGeographies || [];
      mergedData.minimumInvestment = updatedUser.minimumInvestment || 0;
      mergedData.maximumInvestment = updatedUser.maximumInvestment || 0;
      mergedData.investmentCurrency = updatedUser.investmentCurrency || 'USD';
    }

    res.status(200).json({
      success: true,
      message: 'Investor strategy mandate updated successfully',
      data: mergedData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyStrategy,
  saveStrategy,
};

