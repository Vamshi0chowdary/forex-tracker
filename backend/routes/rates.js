const express = require("express");
const { getRates } = require("../services/aggregator");

const router = express.Router();

router.get("/api/rates", async (req, res, next) => {
  try {
    const base = req.query.base || "USD";
    const payload = await getRates(base);
    return res.json(payload);
  } catch (error) {
    // The service should never crash, but this keeps the route safe if something
    // unexpected happens outside provider fallback handling.
    return next(error);
  }
});

module.exports = router;
