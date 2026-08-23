const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/notificationController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markNotificationRead);
router.patch('/read-all', markAllNotificationsRead);

module.exports = router;
