const app = require('./app');
const env = require('./config/env');
const appInfo = require('./config/appInfo');
const { connectDB, disconnectDB } = require('./config/database');
const { startJobRunner, stopJobRunner } = require('./jobs/jobRunner');
const logger = require('./services/loggerService');

const PORT = env.PORT;

let server;

const startServer = async () => {
  try {
    // 1. Connect MongoDB
    try {
      await connectDB();
    } catch (dbErr) {
      if (env.NODE_ENV === 'production') {
        throw dbErr;
      }
      logger.warn('[Database Warning] Initial MongoDB connection failed. Server active in degraded mode; DB operations will retry automatically.', { error: dbErr.message });
    }

    // 2. Start Background Job Scheduler
    startJobRunner();

    // 3. Launch HTTP Server
    server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`===============================================`);
      logger.info(`🚀 ${appInfo.name} v${appInfo.version} API Server active on port ${PORT}`);
      logger.info(`📍 Environment: ${env.NODE_ENV}`);
      logger.info(`📍 Root Endpoint: http://localhost:${PORT}/`);
      logger.info(`📍 Health Check: http://localhost:${PORT}/api/health`);
      logger.info(`📍 Readiness Probe: http://localhost:${PORT}/api/health/ready`);
      logger.info(`===============================================`);
    });
  } catch (err) {
    logger.error(`FATAL: Failed to start ${appInfo.name} server`, { error: err.message });
    process.exit(1);
  }
};

startServer();

// Graceful Shutdown Sequence
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Initiating graceful shutdown sequence...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed cleanly.');

      // Stop background jobs
      stopJobRunner();

      // Disconnect database
      await disconnectDB();

      logger.info(`${appInfo.name} process shutdown complete. Exiting.`);
      process.exit(0);
    });

    // Force exit if shutdown hangs over 10 seconds
    setTimeout(() => {
      logger.error('Shutdown timed out. Forcing process exit.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  logger.error('[Unhandled Promise Rejection]', { error: err.message, stack: err.stack });
});
