import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
