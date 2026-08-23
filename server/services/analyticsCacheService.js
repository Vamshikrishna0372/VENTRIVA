/**
 * Lightweight In-Memory Analytics Cache Abstraction
 */
const cacheMap = new Map();

const DEFAULT_TTL_MS = 60 * 1000; // 1 minute default TTL for analytics

const analyticsCacheService = {
  get(key) {
    const entry = cacheMap.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      cacheMap.delete(key);
      return null;
    }
    return entry.value;
  },

  set(key, value, ttlMs = DEFAULT_TTL_MS) {
    const expiresAt = Date.now() + ttlMs;
    cacheMap.set(key, { value, expiresAt });
  },

  invalidate(key) {
    cacheMap.delete(key);
  },

  invalidateUserCache(userId) {
    const userStr = userId.toString();
    for (const key of cacheMap.keys()) {
      if (key.includes(userStr)) {
        cacheMap.delete(key);
      }
    }
  },

  clear() {
    cacheMap.clear();
  },
};

module.exports = analyticsCacheService;
