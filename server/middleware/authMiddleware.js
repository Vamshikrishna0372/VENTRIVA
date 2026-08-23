const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Protect routes: verifies JWT token from cookie or Authorization header.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check Authorization Bearer header (Active client token takes priority)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Check HttpOnly cookie
  else if (req.cookies && req.cookies.ventriva_token && req.cookies.ventriva_token !== 'none') {
    token = req.cookies.ventriva_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, token missing',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'ventriva_jwt_secret_dev_key_change_in_production';
    const decoded = jwt.verify(token, secret);

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account not found or deactivated',
        });
      }
      req.user = user;
    } else {
      // Fallback object if database is not active
      req.user = { id: decoded.id, role: decoded.role };
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, invalid or expired token',
    });
  }
};

module.exports = {
  protect,
};
