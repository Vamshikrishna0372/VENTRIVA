const { getRoleActions } = require('../services/actionCenterService');

/**
 * @desc    Get real-time database-driven action items for authenticated user role
 * @route   GET /api/actions/my
 * @access  Private (All authenticated roles)
 */
const getMyActions = async (req, res, next) => {
  try {
    const actions = await getRoleActions(req.user);
    res.status(200).json({
      success: true,
      role: req.user.role,
      totalActions: actions.length,
      actions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyActions,
};
