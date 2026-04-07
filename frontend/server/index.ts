import "dotenv/config";
import express from "express";
import cors from "cors";
import { overviewData } from "./data";

export function createServer() {
  const app = express();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3300";

  app.use(
    cors({
      origin: frontendUrl,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/ping", (_req, res) => {
    res.json({
      message: process.env.PING_MESSAGE ?? "AEROCHECK API ready",
      status: "ok",
      apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.API_PORT || 3010}`,
    });
  });

  app.get("/api/overview", (_req, res) => {
    res.status(200).json(overviewData);
  });

  return app;
}
