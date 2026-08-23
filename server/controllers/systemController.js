const fs = require('fs');
const path = require('path');
const appInfo = require('../config/appInfo');
const env = require('../config/env');
const { getDBState } = require('../config/database');
const metricsService = require('../services/metricsService');
const { getJobStatus } = require('../jobs/jobRunner');

/**
 * @desc    Get admin system health diagnostics
 * @route   GET /api/admin/system/health
 * @access  Private (Admin)
 */
const getSystemHealth = async (req, res, next) => {
  try {
    const dbState = getDBState();
    const uploadDir = path.resolve(env.UPLOAD_DIR || './storage/uploads');
    const isStorageWritable = fs.existsSync(uploadDir);

    const health = {
      application: {
        name: appInfo.name,
        version: appInfo.version,
        environment: appInfo.environment,
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
      },
      database: {
        status: dbState.isConnected ? 'ready' : 'disconnected',
        state: dbState.stateName,
      },
      storage: {
        status: isStorageWritable ? 'ready' : 'error',
        dir: uploadDir,
      },
    };

    res.status(200).json({
      success: true,
      data: health,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get operational API metrics
 * @route   GET /api/admin/system/metrics
 * @access  Private (Admin)
 */
const getSystemMetrics = async (req, res, next) => {
  try {
    const metrics = metricsService.getMetrics();
    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get background jobs execution status
 * @route   GET /api/admin/system/jobs
 * @access  Private (Admin)
 */
const getSystemJobs = async (req, res, next) => {
  try {
    const jobs = getJobStatus();
    res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get system API performance statistics
 * @route   GET /api/admin/system/performance
 * @access  Private (Admin)
 */
const getSystemPerformance = async (req, res, next) => {
  try {
    const metrics = metricsService.getMetrics();
    res.status(200).json({
      success: true,
      data: {
        avgResponseTimeMs: metrics.avgResponseTimeMs,
        slowRequestsCount: metrics.slowRequestsCount,
        totalRequests: metrics.totalRequests,
        errorRatePercent: metrics.errorRatePercent,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSystemHealth,
  getSystemMetrics,
  getSystemJobs,
  getSystemPerformance,
};
