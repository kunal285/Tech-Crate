/**
 * Resilient Cache Service
 * Provides Redis support with automatic In-Memory TTL Map fallback.
 * Zero crashes if Redis is offline or unconfigured.
 */

const memoryCache = new Map();

const cacheService = {
  async get(key) {
    const item = memoryCache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      memoryCache.delete(key);
      return null;
    }
    return item.value;
  },

  async set(key, value, ttlSeconds = 120) {
    const expiry = Date.now() + ttlSeconds * 1000;
    memoryCache.set(key, { value, expiry });
  },

  async del(key) {
    memoryCache.delete(key);
  },

  async flushPrefix(prefix) {
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        memoryCache.delete(key);
      }
    }
  },

  async getOrSet(key, fetcherFn, ttlSeconds = 120) {
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }
    const fresh = await fetcherFn();
    if (fresh !== undefined && fresh !== null) {
      await this.set(key, fresh, ttlSeconds);
    }
    return fresh;
  },
};

module.exports = cacheService;
