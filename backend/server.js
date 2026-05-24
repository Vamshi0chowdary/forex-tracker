const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const rateRoutes = require("./routes/rates");
const cache = require("./services/cache");
const { providerPriorityLabels } = require("./services/providers");
const logger = require("./utils/logger");

const app = express();
const port = Number(process.env.PORT || 5000);
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // allow non-browser requests (curl, server-to-server)
      if (!origin) return callback(null, true);

      // explicit override to allow all origins (use with caution)
      if (String(process.env.CORS_ALLOW_ALL || '').toLowerCase() === 'true') {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // allow Railway preview/prod domains automatically
      try {
        const url = new URL(origin);
        if (url.hostname.endsWith('.railway.app')) return callback(null, true);
      } catch (e) {
        // fall through to deny
      }

      return callback(new Error('CORS policy does not allow this origin'));
    },
  })
);
app.use(express.json());

// Serve a prebuilt frontend if present at backend/public (used for single-service deploys)
const staticPath = path.join(__dirname, "public");
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));

  // SPA fallback — serve index.html for non-API routes
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path === "/health" || req.path === "/") return next();
    return res.sendFile(path.join(staticPath, "index.html"));
  });
}

app.get("/", (req, res) => {
  res.json({
    message: "Real-Time Forex Aggregation Service API",
    health: "/health",
    rates: "/api/rates?base=USD",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use(rateRoutes);

app.use((error, req, res, next) => {
  logger.error("unhandled server error", { message: error.message });

  return res.status(500).json({
    error: "Internal server error",
  });
});

const server = app.listen(port, () => {
  logger.info("server started", {
    port,
    environment: process.env.NODE_ENV || "development",
  });
  logger.info("cache initialized", cache.getStats());
  logger.info("providers loaded", { providers: providerPriorityLabels });
});

function shutdown(signal) {
  logger.info("shutdown initiated", { signal });
  server.close(() => {
    logger.info("server stopped", { signal });
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

module.exports = app;
