const User = require('../models/User');
const sendTokenResponse = require('../utils/generateToken');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const { connectDB } = require('../config/database');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to check DB connection readiness
const checkDatabaseConnected = async (res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      if (res && typeof res.status === 'function') {
        res.status(503).json({
          success: false,
          message: 'Database connection unavailable. Please ensure MONGODB_URI is configured.',
        });
      }
      return false;
    }
  }
  return mongoose.connection.readyState === 1;
};

/**
 * @desc    Register a new founder or investor user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    if (!(await checkDatabaseConnected(res))) return;

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Role Security Boundary: Public registration strictly requires Founder or Investor role selection
    const targetRole = role ? role.toLowerCase() : null;
    if (!targetRole || !['founder', 'investor'].includes(targetRole)) {
      return res.status(400).json({
        success: false,
        message: 'Public registration requires a valid role selection (Founder or Investor)',
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

    const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') },
    });
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
    if (!(await checkDatabaseConnected(res))) return;

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const normalizedEmail = String(email || '').trim().toLowerCase();

    const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') },
    }).select('+password');

    const userFound = Boolean(user);
    const hasPassword = Boolean(user && user.password);
    const isMatch = user && user.password ? await user.matchPassword(password) : false;

    console.log('[AUTH DEBUG]');
    console.log('received email:', normalizedEmail);
    console.log('user found:', userFound);
    console.log('user id:', user ? user._id.toString() : 'none');
    console.log('stored role:', user ? user.role : 'none');
    console.log('password hash exists:', hasPassword);
    console.log('password comparison result:', isMatch);

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

/**
 * @desc    Authenticate user via Google ID Token / Credential
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleAuth = async (req, res, next) => {
  try {
    if (!(await checkDatabaseConnected(res))) return;

    const { credential, role } = req.body;
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token/credential is required',
      });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.error('Google ID Token verification failed:', verifyErr);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Google authentication credential',
      });
    }

    if (!payload || !payload.email || !payload.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Google identity verification failed or email not verified',
      });
    }

    const normalizedEmail = payload.email.toLowerCase().trim();
    const googleId = payload.sub;

    let user = await User.findOne({
      $or: [{ googleId }, { email: normalizedEmail }],
    });

    if (user) {
      // Existing User Flow: Link googleId if missing, retain stored role, DO NOT default or overwrite role
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (payload.picture && (!user.avatar || !user.profilePhoto)) {
        user.avatar = user.avatar || payload.picture;
        user.profilePhoto = user.profilePhoto || payload.picture;
      }
      await user.save();

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.',
        });
      }

      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
      return sendTokenResponse(user, 200, res);
    }

    // New Google User Flow: Check if role was selected
    const requestedRole = role ? role.toLowerCase() : null;

    if (!requestedRole || !['founder', 'investor'].includes(requestedRole)) {
      // Return onboarding requirement signal for frontend role selection UI
      return res.status(200).json({
        success: true,
        isNewUser: true,
        requiresOnboarding: true,
        googleIdentity: {
          credential,
          email: normalizedEmail,
          name: payload.name || normalizedEmail.split('@')[0],
          picture: payload.picture || '',
          googleId,
        },
        message: 'Please select a workspace role to complete Ventriva account setup',
      });
    }

    // Create new user with verified role (strictly forbid admin)
    const randomPassword = crypto.randomBytes(16).toString('hex');
    user = await User.create({
      name: payload.name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      password: randomPassword,
      role: requestedRole,
      googleId,
      avatar: payload.picture || '',
      profilePhoto: payload.picture || '',
      isVerified: true,
    });

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    return sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Google OAuth Callback Handler
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
const googleCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    const clientUrl = process.env.CLIENT_URL || 'https://ventriva.vercel.app';

    if (!code) {
      return res.redirect(`${clientUrl}/login?error=google_auth_failed`);
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.redirect(`${clientUrl}/login?error=google_email_missing`);
    }

    const normalizedEmail = payload.email.toLowerCase().trim();
    let user = await User.findOne({
      $or: [{ googleId: payload.sub }, { email: normalizedEmail }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = payload.sub;
        await user.save();
      }
    } else {
      // Redirect new user to client login onboarding flow without default founder role assignment
      return res.redirect(`${clientUrl}/login?onboarding=true&email=${encodeURIComponent(normalizedEmail)}`);
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const targetDashboard = user.role === 'admin' ? '/admin/dashboard' : user.role === 'founder' ? '/founder/dashboard' : '/investor/dashboard';

    res.redirect(`${clientUrl}/login?token=${token}&target=${encodeURIComponent(targetDashboard)}`);
  } catch (error) {
    console.error('Error in googleCallback:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_auth_error`);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  googleAuth,
  googleCallback,
};
