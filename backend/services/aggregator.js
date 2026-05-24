const cache = require("./cache");
const { providerPriority, providerPriorityLabels } = require("./providers");
const logger = require("../utils/logger");

async function getRates(base = "USD") {
  const normalizedBase = String(base || "USD").trim().toUpperCase();

  const freshCache = cache.get(normalizedBase);
  if (freshCache) {
    logger.info("cache hit", { base: normalizedBase, source: freshCache.source });
    return withMetadata(freshCache);
  }

  for (let index = 0; index < providerPriority.length; index += 1) {
    const provider = providerPriority[index];
    const providerResult = await fetchWithRetry(provider, normalizedBase);

    if (providerResult) {
      logger.info("provider success", { base: normalizedBase, source: providerResult.source });

      // Product decision: prefer the first successful provider in priority order.
      // This keeps the response deterministic and avoids mixing FX snapshots from
      // different providers that may be updated at slightly different times.
      return withMetadata(cache.set(normalizedBase, providerResult));
    }

    if (index < providerPriority.length - 1) {
      logger.warn("provider failover", {
        base: normalizedBase,
        from: provider.name,
        to: providerPriority[index + 1].name,
      });
    }
  }

  const staleCache = cache.getAny(normalizedBase);
  if (staleCache) {
    logger.warn("stale cache used", { base: normalizedBase, source: staleCache.source });
    return withMetadata(staleCache);
  }

  logger.error("all providers failed and no cache available", { base: normalizedBase });
  return withMetadata({
    base: normalizedBase,
    timestamp: new Date().toISOString(),
    freshness_seconds: 0,
    source: "unavailable",
    stale: true,
    rates: {},
  });
}

async function fetchWithRetry(provider, base) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await provider.fetch(base);
    } catch (error) {
      if (attempt === 1) {
        logger.warn("retrying provider", { base, source: provider.name, attempt });
        continue;
      }

      logger.warn("provider failed", { base, source: provider.name, attempt, error: error.message });
    }
  }

  return null;
}

function withMetadata(response) {
  return {
    ...response,
    providerPriority: providerPriorityLabels,
  };
}

module.exports = {
  getRates,
  fetchWithRetry,
};
