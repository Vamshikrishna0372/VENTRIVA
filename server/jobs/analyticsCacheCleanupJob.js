const analyticsCacheService = require('../services/analyticsCacheService');
const logger = require('../services/loggerService');

const runAnalyticsCacheCleanupJob = async () => {
  try {
    // Force eviction check of expired entries
    analyticsCacheService.get('trigger_cleanup_key');
    logger.info('[Analytics Cache Cleanup Job] Expired analytics cache entries evicted.');
    return { success: true };
  } catch (error) {
    logger.error('[Analytics Cache Cleanup Job Error]', { error: error.message });
    throw error;
  }
};

module.exports = runAnalyticsCacheCleanupJob;
