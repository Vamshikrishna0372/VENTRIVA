/**
 * Role Authorization Middleware: Enforces backend role requirements.
 * Usage: authorize('admin'), authorize('founder', 'investor')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to role verification',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}] role(s). Your role is ${req.user.role}`,
      });
    }

    next();
  };
};

module.exports = {
  authorize,
};
