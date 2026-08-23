/**
 * Application Version & Build Information Provider
 */
const env = require('./env');

const appInfo = {
  name: 'VENTRIVA',
  tagline: 'Discover. Evaluate. Connect.',
  version: '1.0.0',
  environment: env.NODE_ENV,
  buildId: process.env.BUILD_ID || `build-${Date.now()}`,
  startupTimestamp: new Date().toISOString(),
};

module.exports = appInfo;
