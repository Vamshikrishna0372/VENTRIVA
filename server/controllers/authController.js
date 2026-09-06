const User = require('../models/User');
const sendTokenResponse = require('../utils/generateToken');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const { connectDB } = require('../config/database');

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

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

    if (!hasPassword && user.googleId) {
      return res.status(401).json({
        success: false,
        message: 'This account was registered using Google Sign-In. Please sign in with Google.',
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
        audience: env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.error('Google ID Token verification failed:', verifyErr.message || verifyErr);
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
    user = await User.create({
      name: payload.name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
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
 * Helper: Resolve canonical Google OAuth redirect URI matching Google Cloud Console registration
 */
const getGoogleRedirectUri = (req) => {
  const host = req ? req.get('host') || '' : '';
  if (host.includes('onrender.com') || env.NODE_ENV === 'production') {
    return 'https://ventriva.onrender.com/api/auth/google/callback';
  }
  return `${req.protocol}://${host}/api/auth/google/callback`;
};

/**
 * Helper: Resolve target frontend client URL
 */
const getClientUrl = (req) => {
  const host = req ? req.get('host') || '' : '';
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return env.CLIENT_URL || 'http://localhost:5173';
  }
  return env.CLIENT_URL || 'https://ventriva.vercel.app';
};

/**
 * @desc    Initiate Google OAuth 2.0 full-page redirect flow
 * @route   GET /api/auth/google/start
 * @access  Public
 */
const googleStart = async (req, res) => {
  try {
    const { role, target } = req.query;
    const redirectUri = getGoogleRedirectUri(req);
    const oauth2Client = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const statePayload = {
      csrf: crypto.randomBytes(16).toString('hex'),
      role: role && ['founder', 'investor'].includes(role.toLowerCase()) ? role.toLowerCase() : null,
      target: target ? encodeURIComponent(target) : null,
      timestamp: Date.now(),
    };
    const state = Buffer.from(JSON.stringify(statePayload)).toString('base64url');

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email'],
      prompt: 'select_account',
      state,
    });

    console.log('[GOOGLE-AUTH-START] Initiating full-page OAuth redirect flow to Google', {
      redirectUri,
      targetRole: statePayload.role,
    });
    console.log('[GOOGLE-AUTH-REDIRECT] Redirecting browser to Google OAuth consent URL');

    return res.redirect(authUrl);
  } catch (error) {
    console.error('[GOOGLE-AUTH-ERROR] Exception in googleStart:', error.message || error);
    const clientUrl = getClientUrl(req);
    return res.redirect(`${clientUrl}/login?error=google_start_failed`);
  }
};

/**
 * @desc    Google OAuth Callback Handler
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
const googleCallback = async (req, res, next) => {
  const clientUrl = getClientUrl(req);
  try {
    const { code, state, error: oauthError } = req.query;

    console.log('[GOOGLE-AUTH-CALLBACK] Google OAuth callback endpoint reached', {
      hasCode: Boolean(code),
      hasState: Boolean(state),
      oauthError: oauthError || null,
    });

    if (oauthError || !code) {
      console.warn('[GOOGLE-AUTH-ERROR] OAuth authorization denied or cancelled by user:', oauthError);
      return res.redirect(`${clientUrl}/login?error=google_auth_failed`);
    }

    console.log('[GOOGLE-AUTH-CODE-RECEIVED] Authorization code received from Google');

    let stateData = {};
    if (state) {
      try {
        stateData = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
      } catch (e) {
        console.warn('[GOOGLE-AUTH-ERROR] Failed to parse OAuth state parameter:', e.message);
      }
    }

    const redirectUri = getGoogleRedirectUri(req);
    const oauth2Client = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    console.log('[GOOGLE-AUTH-BACKEND-VERIFY] Exchanging authorization code with Google token endpoint');
    const { tokens } = await oauth2Client.getToken(code);

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.email_verified) {
      console.error('[GOOGLE-AUTH-ERROR] Google payload email missing or unverified');
      return res.redirect(`${clientUrl}/login?error=google_email_missing`);
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
        console.warn('[GOOGLE-AUTH-ERROR] Deactivated user attempted login:', user.email);
        return res.redirect(`${clientUrl}/login?error=account_deactivated`);
      }

      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

      console.log('[GOOGLE-AUTH-SUCCESS] Google authenticated existing user:', user.email);
      console.log('[GOOGLE-AUTH-ROLE-SYNC] Synchronized database role for existing user:', user.role);

      const token = jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, { expiresIn: '30d' });
      console.log('[GOOGLE-AUTH-SESSION-ESTABLISHED] JWT session token minted for existing user');

      const targetDashboard = user.role === 'admin' ? '/admin/dashboard' : user.role === 'founder' ? '/founder/dashboard' : '/investor/dashboard';
      console.log('[GOOGLE-AUTH-NAVIGATION] Redirecting to client login with token and role dashboard:', targetDashboard);

      return res.redirect(`${clientUrl}/login?token=${token}&target=${encodeURIComponent(targetDashboard)}`);
    }

    // New Google User Flow: Check if role was pre-selected in state (e.g. from RegisterPage)
    const requestedRole = stateData.role ? stateData.role.toLowerCase() : null;

    if (requestedRole && ['founder', 'investor'].includes(requestedRole)) {
      user = await User.create({
        name: payload.name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: requestedRole,
        googleId,
        avatar: payload.picture || '',
        profilePhoto: payload.picture || '',
        isVerified: true,
      });

      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

      console.log('[GOOGLE-AUTH-SUCCESS] Google created new user with pre-selected role:', requestedRole);
      console.log('[GOOGLE-AUTH-ROLE-SYNC] New user role established:', user.role);

      const token = jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, { expiresIn: '30d' });
      console.log('[GOOGLE-AUTH-SESSION-ESTABLISHED] JWT session token minted for new user');

      const targetDashboard = user.role === 'founder' ? '/founder/dashboard' : '/investor/dashboard';
      console.log('[GOOGLE-AUTH-NAVIGATION] Redirecting to client login with token and role dashboard:', targetDashboard);

      return res.redirect(`${clientUrl}/login?token=${token}&target=${encodeURIComponent(targetDashboard)}`);
    }

    // New User without Role: Generate signed short-lived onboarding token (15 mins)
    console.log('[GOOGLE-AUTH-SUCCESS] New Google user requires role onboarding selection');
    const onboardingToken = jwt.sign(
      {
        onboarding: true,
        email: normalizedEmail,
        googleId,
        name: payload.name || normalizedEmail.split('@')[0],
        picture: payload.picture || '',
      },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const onboardingParams = new URLSearchParams({
      onboardingToken,
      email: normalizedEmail,
      name: payload.name || normalizedEmail.split('@')[0],
    });
    if (payload.picture) {
      onboardingParams.set('picture', payload.picture);
    }

    return res.redirect(`${clientUrl}/login?${onboardingParams.toString()}`);
  } catch (error) {
    console.error('[GOOGLE-AUTH-ERROR] Error in googleCallback:', error.message || error);
    return res.redirect(`${clientUrl}/login?error=google_auth_error`);
  }
};

/**
 * @desc    Complete Google Role Onboarding for new users
 * @route   POST /api/auth/google/complete-onboarding
 * @access  Public
 */
const completeGoogleOnboarding = async (req, res, next) => {
  try {
    if (!(await checkDatabaseConnected(res))) return;

    const { onboardingToken, role } = req.body;
    if (!onboardingToken || !role) {
      return res.status(400).json({
        success: false,
        message: 'Onboarding token and workspace role are required',
      });
    }

    const requestedRole = role.toLowerCase().trim();
    if (!['founder', 'investor'].includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workspace role. Only Founder or Investor is allowed.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(onboardingToken, env.JWT_SECRET);
    } catch (err) {
      console.error('[GOOGLE-AUTH-ERROR] Invalid or expired onboarding token:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Onboarding session has expired. Please sign in with Google again.',
      });
    }

    if (!decoded.onboarding || !decoded.email || !decoded.googleId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid onboarding token payload',
      });
    }

    const normalizedEmail = decoded.email.toLowerCase().trim();
    let user = await User.findOne({
      $or: [{ googleId: decoded.googleId }, { email: normalizedEmail }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = decoded.googleId;
        await user.save();
      }
      return sendTokenResponse(user, 200, res);
    }

    // Create new user with chosen role
    user = await User.create({
      name: decoded.name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      role: requestedRole,
      googleId: decoded.googleId,
      avatar: decoded.picture || '',
      profilePhoto: decoded.picture || '',
      isVerified: true,
    });

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    console.log('[GOOGLE-AUTH-SUCCESS] Role onboarding completed for user:', user.email, 'Role:', user.role);

    return sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  googleAuth,
  googleStart,
  googleCallback,
  completeGoogleOnboarding,
};
