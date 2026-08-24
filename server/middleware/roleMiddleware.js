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

    const userRole = (req.user.role || '').toString().toLowerCase();
    const allowedRoles = roles.map((r) => r.toString().toLowerCase());

    if (!allowedRoles.includes(userRole)) {
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
