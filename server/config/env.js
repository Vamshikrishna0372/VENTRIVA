/**
 * Centralized Environment Configuration & Fail-Fast Validator
 */
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });


const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ventriva',
  JWT_SECRET: process.env.JWT_SECRET || 'ventriva_super_secret_jwt_key_2026',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.resolve(__dirname, '../storage/uploads'),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  SLOW_REQUEST_THRESHOLD_MS: parseInt(process.env.SLOW_REQUEST_THRESHOLD_MS || '1000', 10),
  NOTIFICATION_RETENTION_DAYS: parseInt(process.env.NOTIFICATION_RETENTION_DAYS || '90', 10),
  DRY_RUN_CLEANUP: process.env.DRY_RUN_CLEANUP !== 'false',
};

// Fail-Fast Validation in Production
const validateEnv = () => {
  if (env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('FATAL: Production JWT_SECRET must be at least 32 characters long');
    }
    if (!process.env.MONGODB_URI) {
      throw new Error('FATAL: Production MONGODB_URI environment variable is required');
    }
    if (!process.env.CLIENT_URL) {
      throw new Error('FATAL: Production CLIENT_URL environment variable is required');
    }
  }
};

validateEnv();

module.exports = env;
