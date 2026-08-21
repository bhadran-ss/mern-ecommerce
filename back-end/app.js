import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import authRouter from "./route/auth.router.js";
import cartRouter from "./route/cart.router.js";
import { createHealthRouter } from "./route/health.router.js";
import PaymentRouter from "./route/payment.router.js";
import productRouter from "./route/product.router.js";
import {
  createErrorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import {
  createRequestLogger,
  requestContext,
} from "./middleware/request.middleware.js";

export const createApp = ({ config, logger, getReadiness }) => {
  const app = express();
  const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
  const frontendPath = path.join(currentDirectory, "../front-end/dist");

  app.disable("x-powered-by");
  app.use(requestContext);
  app.use(createRequestLogger(logger));
  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
    }),
  );

  app.use("/api", createHealthRouter({ getReadiness }));
  app.use("/api/auth", authRouter);
  app.use("/api/products", productRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/payment", PaymentRouter);

  app.use("/api", notFoundHandler);

  if (config.nodeEnv === "production") {
    app.use(express.static(frontendPath));
    app.get(/.*/, (_req, res) => {
      res.sendFile(path.join(frontendPath, "index.html"));
    });
  } else {
    app.get("/", (_req, res) => {
      res.send("Server is working (development mode)");
    });
  }

  app.use(notFoundHandler);
  app.use(createErrorHandler({ logger }));

  return app;
};
