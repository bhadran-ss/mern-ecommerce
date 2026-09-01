import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import config from "./config/env.js";
import { ApiError, errorHandler, notFoundHandler } from "./middleware/errors.js";
import { requestIdMiddleware, requestLogger } from "./middleware/request-id.js";
import { isDatabaseReady } from "./lib/db.js";
import { isRedisReady } from "./lib/Redis.js";
import { logger } from "./lib/logger.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRouter from "./route/auth.router.js";
import productRouter from "./route/product.router.js";
import cartRouter from "./route/cart.router.js";
import paymentRouter from "./route/payment.router.js";
import { handleStripeWebhook } from "./controllers/payment.controller.js";

const allowedOrigins = new Set([new URL(config.CLIENT_URL).origin]);

export const createApp = () => {
  const apiRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === "/health" || req.path === "/ready",
    handler: (req, res) =>
      res.status(429).json({
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests. Please try again later.",
        },
        requestId: req.id,
      }),
  });

  const app = express();
  app.locals.logger = logger;

  app.use(requestIdMiddleware);
  app.use(requestLogger(logger));
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          fontSrc: ["'self'", "https:", "data:"],
          formAction: ["'self'", "https://checkout.stripe.com"],
          frameAncestors: ["'self'"],
          frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
          imgSrc: ["'self'", "data:", "https:"],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'", "https://js.stripe.com"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'", "https://api.stripe.com", "https://r.stripe.com"],
        },
      },
    }),
  );
  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          return callback(null, true);
        }
        return callback(new ApiError(403, "CORS_ORIGIN_DENIED", "Origin not allowed."));
      },
    }),
  );

  app.post(
    "/api/payment/webhook",
    express.raw({ type: "application/json", limit: "1mb" }),
    handleStripeWebhook,
  );

  app.use("/api", apiRateLimit);
  app.use(express.json({ limit: "10mb" }));
  app.use(cookieParser());

  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", requestId: req.id });
  });

  app.get("/api/ready", async (req, res) => {
    const [database, redis] = await Promise.all([
      isDatabaseReady(),
      isRedisReady(),
    ]);
    const dependencies = { database, redis };
    const ready = Object.values(dependencies).every(Boolean);

    res.status(ready ? 200 : 503).json({
      status: ready ? "ready" : "not_ready",
      dependencies,
      requestId: req.id,
    });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/products", productRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/payment", paymentRouter);
  app.use("/api", notFoundHandler);

  if (config.NODE_ENV === "production") {
    const frontendPath = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../front-end/dist",
    );
    app.use(express.static(frontendPath));
    app.get(/.*/, (req, res, next) => {
      res.sendFile(path.join(frontendPath, "index.html"), (error) => {
        if (error) next(error);
      });
    });
  } else {
    app.get("/", (req, res) => {
      res.status(200).send("Server is working (development mode)");
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

const app = createApp();
export default app;
