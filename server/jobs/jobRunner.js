const runNotificationCleanupJob = require('./notificationCleanupJob');
const runDocumentCleanupJob = require('./documentCleanupJob');
const runAnalyticsCacheCleanupJob = require('./analyticsCacheCleanupJob');
const logger = require('../services/loggerService');

let intervalId = null;
const jobStatus = {
  lastExecutionAt: null,
  status: 'idle',
  jobsRunCount: 0,
};

const startJobRunner = (intervalMs = 60 * 60 * 1000) => { // Hourly background worker
  if (intervalId) return;

  const executeAllJobs = async () => {
    jobStatus.status = 'running';
    try {
      await runNotificationCleanupJob();
      await runDocumentCleanupJob();
      await runAnalyticsCacheCleanupJob();

      jobStatus.lastExecutionAt = new Date().toISOString();
      jobStatus.jobsRunCount += 1;
      jobStatus.status = 'idle';
    } catch (err) {
      logger.error('[Background Job Runner Error]', { error: err.message });
      jobStatus.status = 'error';
    }
  };

  // Run initial pass after 10s
  setTimeout(executeAllJobs, 10000);
  intervalId = setInterval(executeAllJobs, intervalMs);

  logger.info('[Background Job Runner] Scheduler initialized.');
};

const stopJobRunner = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    jobStatus.status = 'stopped';
    logger.info('[Background Job Runner] Scheduler stopped.');
  }
};

const getJobStatus = () => ({
  ...jobStatus,
  isRunning: Boolean(intervalId),
});

module.exports = {
  startJobRunner,
  stopJobRunner,
  getJobStatus,
  runNotificationCleanupJob,
  runDocumentCleanupJob,
  runAnalyticsCacheCleanupJob,
};
