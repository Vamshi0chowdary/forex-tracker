const axios = require("axios");
const logger = require("../utils/logger");

const timeoutMs = Number(process.env.PROVIDER_TIMEOUT_MS || 5000);
const http = axios.create({
  timeout: timeoutMs,
  headers: {
    Accept: "application/json",
  },
});

async function fetchExchangeRateHost(base) {
  return normalizeProviderResponse(
    "exchangerate.host",
    base,
    await requestJson("https://api.exchangerate.host/latest", { base })
  );
}

async function fetchOpenErApi(base) {
  return normalizeProviderResponse(
    "open.er-api.com",
    base,
    await requestJson(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`)
  );
}

async function fetchFrankfurter(base) {
  return normalizeProviderResponse(
    "frankfurter.app",
    base,
    await requestJson("https://api.frankfurter.app/latest", { from: base })
  );
}

async function requestJson(url, params) {
  const response = await http.get(url, { params });
  return response.data;
}

function normalizeProviderResponse(source, requestedBase, payload) {
  const rates = extractRates(payload);
  const base = extractBase(payload, requestedBase);
  const timestamp = extractTimestamp(payload);

  return {
    base,
    timestamp,
    source,
    rates,
  };
}

function extractRates(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Provider response is not an object");
  }

  const rates = payload.rates;
  if (!rates || typeof rates !== "object") {
    throw new Error("Provider response missing rates");
  }

  return Object.entries(rates).reduce((acc, [currency, value]) => {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      acc[currency.toUpperCase()] = parsed;
    }
    return acc;
  }, {});
}

function extractBase(payload, requestedBase) {
  const candidate = payload.base || payload.base_code || requestedBase;
  return String(candidate || requestedBase).trim().toUpperCase();
}

function extractTimestamp(payload) {
  const candidate = payload.date || payload.time_last_update_utc || payload.timestamp;
  if (candidate) {
    return String(candidate);
  }

  return new Date().toISOString();
}

const providerPriority = [
  {
    name: "exchangerate.host",
    fetch: fetchExchangeRateHost,
  },
  {
    name: "open.er-api.com",
    fetch: fetchOpenErApi,
  },
  {
    name: "frankfurter.app",
    fetch: fetchFrankfurter,
  },
];

const providerPriorityLabels = ["ExchangeRate.host", "Open ER API", "Frankfurter"];

module.exports = {
  providerPriority,
  providerPriorityLabels,
  fetchExchangeRateHost,
  fetchOpenErApi,
  fetchFrankfurter,
  requestJson,
  normalizeProviderResponse,
  extractRates,
  extractBase,
  extractTimestamp,
};
