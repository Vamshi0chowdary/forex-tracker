const { getRates } = require('../backend/services/aggregator');

module.exports = async (req, res) => {
  const base = (req.query.base || req.body && req.body.base || 'USD').toString().trim().toUpperCase();

  try {
    const data = await getRates(base);
    // Allow the frontend to call this endpoint from Vercel deployment
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: String(err && err.message ? err.message : err) });
  }
};
