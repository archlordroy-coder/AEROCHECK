import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import metadataRoutes from "./routes/metadata.js";
import workflowRoutes from "./routes/workflow.js";
import { overviewData } from "./data.js";
import { errorHandler } from "./lib/error-handler.js";
import { logger } from "./lib/logger.js";

export function createServer() {
  const app = express();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";

  // Request Logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      logger.info({
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
      });
    });
    next();
  });

  app.use(
    cors({
      origin: frontendUrl,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/metadata", metadataRoutes);
  app.use("/api/workflow", workflowRoutes);

  app.get("/api/ping", (_req, res) => {
    res.json({
      message: process.env.PING_MESSAGE ?? "AEROCHECK API ready",
      status: "ok",
      apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.API_PORT || 3000}`,
    });
  });

  app.get("/api/overview", (_req, res) => {
    res.status(200).json(overviewData);
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
