const User = require('../models/User');

/**
 * @desc    Get current investor's profile & preferences
 * @route   GET /api/investors/me
 * @access  Private (Investor)
 */
const getInvestorProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Investor profile not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update investor's profile & investment preferences
 * @route   PUT /api/investors/me
 * @access  Private (Investor)
 */
const updateInvestorProfile = async (req, res, next) => {
  try {
    const {
      name,
      professionalTitle,
      organization,
      phone,
      bio,
      location,
      linkedin,
      preferredSectors,
      preferredStages,
      preferredBusinessModels,
      preferredGeographies,
      minimumInvestment,
      maximumInvestment,
      investmentCurrency,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Investor profile not found' });
    }

    if (name) user.name = name.trim();
    if (professionalTitle !== undefined) user.professionalTitle = professionalTitle;
    if (organization !== undefined) user.organization = organization;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (linkedin !== undefined) user.linkedin = linkedin;

    if (Array.isArray(preferredSectors)) user.preferredSectors = preferredSectors;
    if (Array.isArray(preferredStages)) user.preferredStages = preferredStages;
    if (Array.isArray(preferredBusinessModels)) user.preferredBusinessModels = preferredBusinessModels;
    if (Array.isArray(preferredGeographies)) user.preferredGeographies = preferredGeographies;

    if (minimumInvestment !== undefined) user.minimumInvestment = Number(minimumInvestment) || 0;
    if (maximumInvestment !== undefined) user.maximumInvestment = Number(maximumInvestment) || 0;
    if (investmentCurrency !== undefined) user.investmentCurrency = investmentCurrency;

    if (user.minimumInvestment > 0 && user.maximumInvestment > 0 && user.minimumInvestment > user.maximumInvestment) {
      return res.status(400).json({
        success: false,
        message: 'Minimum investment check size cannot exceed maximum check size',
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Investor preferences updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

const { getMatchingStartupsForInvestor } = require('../services/investorMatchingService');

/**
 * @desc    Get top startup matches for authenticated investor
 * @route   GET /api/investors/matches
 * @access  Private (Investor)
 */
const getInvestorMatches = async (req, res, next) => {
  try {
    const matches = await getMatchingStartupsForInvestor(req.user._id, req.query);
    res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get eligible investor profiles for invitations & discovery
 * @route   GET /api/investors
 * @access  Private (Founder, Investor, Admin)
 */
const getInvestors = async (req, res, next) => {
  try {
    const investors = await User.find({ role: 'investor', isActive: { $ne: false }, isDeleted: { $ne: true } })
      .select('name email organization avatar professionalTitle location linkedin createdAt')
      .lean();

    res.status(200).json({
      success: true,
      count: investors.length,
      data: investors,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvestorProfile,
  updateInvestorProfile,
  getInvestorMatches,
  getInvestors,
};
