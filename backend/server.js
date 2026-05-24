const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
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
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS policy does not allow this origin"));
    },
  })
);
app.use(express.json());

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
