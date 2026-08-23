/**
 * Bounded Operational Metrics Service
 */
const metricsStore = {
  totalRequests: 0,
  successRequests: 0,
  clientErrors: 0, // 4xx
  serverErrors: 0, // 5xx
  authFailures: 0,
  rateLimitEvents: 0,
  slowRequestsCount: 0,
  totalResponseTimeMs: 0,
  startedAt: new Date().toISOString(),
};

const metricsService = {
  recordRequest(statusCode, durationMs) {
    metricsStore.totalRequests += 1;
    metricsStore.totalResponseTimeMs += durationMs;

    if (statusCode >= 200 && statusCode < 400) {
      metricsStore.successRequests += 1;
    } else if (statusCode >= 400 && statusCode < 500) {
      metricsStore.clientErrors += 1;
      if (statusCode === 401 || statusCode === 403) {
        metricsStore.authFailures += 1;
      }
      if (statusCode === 429) {
        metricsStore.rateLimitEvents += 1;
      }
    } else if (statusCode >= 500) {
      metricsStore.serverErrors += 1;
    }

    if (durationMs > 1000) {
      metricsStore.slowRequestsCount += 1;
    }
  },

  getMetrics() {
    const avgResponseTimeMs = metricsStore.totalRequests > 0
      ? Math.round(metricsStore.totalResponseTimeMs / metricsStore.totalRequests)
      : 0;

    return {
      ...metricsStore,
      avgResponseTimeMs,
      errorRatePercent: metricsStore.totalRequests > 0
        ? Number(((metricsStore.serverErrors / metricsStore.totalRequests) * 100).toFixed(2))
        : 0,
    };
  },

  reset() {
    metricsStore.totalRequests = 0;
    metricsStore.successRequests = 0;
    metricsStore.clientErrors = 0;
    metricsStore.serverErrors = 0;
    metricsStore.authFailures = 0;
    metricsStore.rateLimitEvents = 0;
    metricsStore.slowRequestsCount = 0;
    metricsStore.totalResponseTimeMs = 0;
    metricsStore.startedAt = new Date().toISOString();
  },
};

module.exports = metricsService;
