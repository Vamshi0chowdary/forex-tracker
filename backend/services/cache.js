const ttlSeconds = Number(process.env.CACHE_TTL_SECONDS || 300);

class RateCache {
  constructor() {
    this.store = new Map();
    this.lastSuccessfulResponse = null;
  }

  get(base) {
    const key = normalizeBase(base);
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    const ageSeconds = this.getAgeSeconds(entry);
    if (ageSeconds >= ttlSeconds) {
      return null;
    }

    return this.toResponse(entry, ageSeconds, false);
  }

  getAny(base) {
    const key = normalizeBase(base);
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    return this.toResponse(entry, this.getAgeSeconds(entry), true);
  }

  set(base, response) {
    const key = normalizeBase(base);
    const entry = {
      base: key,
      timestamp: response.timestamp,
      source: response.source,
      rates: { ...response.rates },
      fetchedAt: Date.now(),
    };

    this.store.set(key, entry);
    this.lastSuccessfulResponse = entry;

    return this.toResponse(entry, 0, false);
  }

  getAgeSeconds(entry) {
    return Math.max(0, Math.floor((Date.now() - entry.fetchedAt) / 1000));
  }

  toResponse(entry, freshnessSeconds, stale) {
    return {
      base: entry.base,
      timestamp: entry.timestamp,
      source: entry.source,
      freshness_seconds: freshnessSeconds,
      stale,
      rates: { ...entry.rates },
    };
  }

  getStats() {
    return {
      ttlSeconds,
      entries: this.store.size,
    };
  }
}

function normalizeBase(base) {
  return String(base || "USD").trim().toUpperCase();
}

module.exports = new RateCache();
module.exports.RateCache = RateCache;
module.exports.CACHE_TTL_SECONDS = ttlSeconds;
