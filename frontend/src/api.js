import axios from 'axios';

// Use explicit VITE_API_URL when provided. In production, default to same-origin
// so the built frontend talks to the host serving `/api/*` (useful for single-service deploys).
const apiBaseUrl = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:5000');

const client = axios.create({
  baseURL: apiBaseUrl,
  timeout: 5000,
  headers: {
    Accept: 'application/json',
  },
});

export async function fetchRates(base) {
  const response = await client.get('/api/rates', {
    params: { base },
  });

  return response.data;
}
