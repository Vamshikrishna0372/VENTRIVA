const Notification = require('../models/Notification');
const env = require('../config/env');
const logger = require('../services/loggerService');

const runNotificationCleanupJob = async () => {
  try {
    const days = env.NOTIFICATION_RETENTION_DAYS || 90;
    const cutoffDate = new Date(Date.now() - days * 24 * 3600 * 1000);

    // Delete read notifications older than retention days
    const result = await Notification.deleteMany({
      isRead: true,
      createdAt: { $lt: cutoffDate },
    });

    logger.info(`[Notification Cleanup Job] Purged ${result.deletedCount} read notifications older than ${days} days.`);
    return { deletedCount: result.deletedCount, cutoffDate };
  } catch (error) {
    logger.error('[Notification Cleanup Job Error]', { error: error.message });
    throw error;
  }
};

module.exports = runNotificationCleanupJob;
