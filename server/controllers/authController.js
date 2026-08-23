const User = require('../models/User');
const sendTokenResponse = require('../utils/generateToken');
const mongoose = require('mongoose');

// Helper to check DB connection readiness
const checkDatabaseConnected = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please ensure MONGODB_URI is configured.',
    });
    return false;
  }
  return true;
};

/**
 * @desc    Register a new founder or investor user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    if (!checkDatabaseConnected(res)) return;

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Role Security Boundary: Public registration strictly forbids 'admin'
    const targetRole = role ? role.toLowerCase() : 'founder';
    if (!['founder', 'investor'].includes(targetRole)) {
      return res.status(400).json({
        success: false,
        message: 'Public registration is strictly restricted to Founder and Investor accounts',
      });
    }

    // Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters in length',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email (Case-insensitive & trimmed)
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in instead.',
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: targetRole,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    if (!checkDatabaseConnected(res)) return;

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user & select password hash for verification
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login timestamp safely without invoking document pre-save hook
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logoutUser = (req, res) => {
  res.cookie('ventriva_token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Successfully logged out',
  });
};

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
};
