const User = require('../models/User');

/**
 * @desc    Get current founder's profile
 * @route   GET /api/founders/me
 * @access  Private (Founder)
 */
const getFounderProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Founder profile not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update founder's personal profile
 * @route   PUT /api/founders/me
 * @access  Private (Founder)
 */
const updateFounderProfile = async (req, res, next) => {
  try {
    const { name, bio, phone, linkedin, location, profilePhoto, professionalTitle, yearsOfExperience } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Founder profile not found' });
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (location !== undefined) user.location = location;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
    if (professionalTitle !== undefined) user.professionalTitle = professionalTitle;
    if (yearsOfExperience !== undefined) user.yearsOfExperience = Number(yearsOfExperience) || 0;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Founder profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFounderProfile,
  updateFounderProfile,
};
