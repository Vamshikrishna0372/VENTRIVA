const env = require('../config/env');

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevelNum = LOG_LEVELS[env.LOG_LEVEL] !== undefined ? LOG_LEVELS[env.LOG_LEVEL] : 2;

const sanitizeLogData = (data) => {
  if (!data || typeof data !== 'object') return data;
  const sanitized = { ...data };
  const sensitiveKeys = ['password', 'jwt', 'token', 'authorization', 'cookie', 'secret', 'privateNote'];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  }
  return sanitized;
};

const formatLog = (level, message, meta = {}) => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitizeLogData(meta),
  };

  if (env.NODE_ENV === 'production') {
    return JSON.stringify(payload);
  }
  return `[${payload.timestamp}] ${level.toUpperCase()}: ${message} ${Object.keys(meta).length ? JSON.stringify(sanitizeLogData(meta)) : ''}`;
};

const loggerService = {
  error(message, meta) {
    if (currentLevelNum >= LOG_LEVELS.error) {
      console.error(formatLog('error', message, meta));
    }
  },
  warn(message, meta) {
    if (currentLevelNum >= LOG_LEVELS.warn) {
      console.warn(formatLog('warn', message, meta));
    }
  },
  info(message, meta) {
    if (currentLevelNum >= LOG_LEVELS.info) {
      console.log(formatLog('info', message, meta));
    }
  },
  debug(message, meta) {
    if (currentLevelNum >= LOG_LEVELS.debug) {
      console.debug(formatLog('debug', message, meta));
    }
  },
};

module.exports = loggerService;
