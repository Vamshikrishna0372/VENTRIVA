const Notification = require('../models/Notification');

/**
 * @desc    Get current user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.status(200).json({ success: true, unreadCount });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read for current user
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
};
