const jwt = require('jsonwebtoken');

/**
 * Generates JWT Token and configures HttpOnly Auth Cookie.
 */
const sendTokenResponse = (user, statusCode, res) => {
  const payload = {
    id: user._id,
    role: user.role,
  };

  const secret = process.env.JWT_SECRET || 'ventriva_jwt_secret_dev_key_change_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  const token = jwt.sign(payload, secret, { expiresIn });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  };

  res
    .status(statusCode)
    .cookie('ventriva_token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
    });
};

module.exports = sendTokenResponse;
