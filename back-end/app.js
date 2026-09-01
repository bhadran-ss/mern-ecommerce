import path from "node:path";
import { fileURLToPath } from "node:url";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import authRouter from "./route/auth.router.js";
import cartRouter from "./route/cart.router.js";
import PaymentRouter from "./route/payment.router.js";
import productRouter from "./route/product.router.js";
import {
  ApiError,
  createErrorHandler,
  createErrorResponseNormalizer,
  notFoundHandler,
} from "./middleware/errors.js";
import { createRequestContext } from "./middleware/request-context.js";
import { csrfProtection as defaultCsrfProtection } from "./middleware/csrf.middleware.js";
import { logger as defaultLogger } from "./lib/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registerDefaultApiRoutes = (app) => {
  app.use("/api/auth", authRouter);
  app.use("/api/products", productRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/payment", PaymentRouter);
};

const createCorsOptions = (clientUrl) => {
  const allowedOrigins = new Set([clientUrl.replace(/\/+$/, "")]);

  return {
    credentials: true,
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(
        new ApiError(403, "CORS_ORIGIN_DENIED", "Request origin is not allowed"),
      );
    },
  };
};

const defaultRateLimitOptions = Object.freeze({
  windowMs: 15 * 60 * 1_000,
  limit: 300,
});

export const createApp = ({
  config,
  logger = defaultLogger,
  getDependencyStatus,
  registerApiRoutes = registerDefaultApiRoutes,
  rateLimitOptions = defaultRateLimitOptions,
  csrfProtection = defaultCsrfProtection,
} = {}) => {
  if (!config) {
    throw new Error("Application configuration is required");
  }

  if (typeof getDependencyStatus !== "function") {
    throw new Error("Dependency status provider is required");
  }

  const app = express();
  app.disable("x-powered-by");
  app.use(createRequestContext({ logger }));
  app.use(
    helmet({
      contentSecurityPolicy:
        config.nodeEnv === "production"
          ? {
              directives: {
                scriptSrc: ["'self'", "https://js.stripe.com"],
                connectSrc: ["'self'", "https://api.stripe.com"],
                frameSrc: [
                  "'self'",
                  "https://js.stripe.com",
                  "https://hooks.stripe.com",
                ],
                imgSrc: ["'self'", "data:", "https:"],
              },
            }
          : false,
    }),
  );
  app.use(cors(createCorsOptions(config.clientUrl)));
  app.use(
    "/api",
    rateLimit({
      ...defaultRateLimitOptions,
      ...rateLimitOptions,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req, _res, next) =>
        next(
          new ApiError(
            429,
            "RATE_LIMIT_EXCEEDED",
            "Too many requests; please try again later",
          ),
        ),
    }),
  );

  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      requestId: req.id,
    });
  });

  app.get("/api/ready", async (req, res, next) => {
    try {
      const dependencies = await getDependencyStatus();
      const ready = dependencies.mongodb && dependencies.redis;

      res.status(ready ? 200 : 503).json({
        status: ready ? "ready" : "not_ready",
        dependencies: {
          mongodb: Boolean(dependencies.mongodb),
          redis: Boolean(dependencies.redis),
        },
        requestId: req.id,
      });
    } catch (error) {
      next(error);
    }
  });

  app.use(createErrorResponseNormalizer({ logger }));
  app.use(cookieParser());
  app.use("/api", csrfProtection);
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: false, limit: "100kb" }));

  registerApiRoutes(app);
  app.use("/api", notFoundHandler);

  if (config.nodeEnv === "production") {
    const frontendPath = path.join(__dirname, "../front-end/dist");
    app.use(express.static(frontendPath));
    app.get(/.*/, (_req, res) => {
      res.sendFile(path.join(frontendPath, "index.html"));
    });
  } else {
    app.get("/", (_req, res) => {
      res.send("Server is working (development mode)");
    });
    app.use(notFoundHandler);
  }

  app.use(createErrorHandler({ logger }));
  return app;
};
