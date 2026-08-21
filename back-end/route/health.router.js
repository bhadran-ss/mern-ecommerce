import express from "express";
import { AppError } from "../utils/app-error.js";

export const createHealthRouter = ({ getReadiness, startedAt = Date.now() }) => {
  const router = express.Router();

  router.get("/health", (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: "ok",
        uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
        timestamp: new Date().toISOString(),
      },
    });
  });

  router.get("/ready", async (_req, res) => {
    const readiness = await getReadiness();
    if (!readiness.ready) {
      throw new AppError(
        503,
        "SERVICE_NOT_READY",
        "The service is not ready to accept requests.",
        { details: readiness.services },
      );
    }

    res.status(200).json({
      success: true,
      data: {
        status: "ready",
        services: readiness.services,
      },
    });
  });

  return router;
};
