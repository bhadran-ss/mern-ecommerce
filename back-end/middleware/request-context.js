import { randomUUID } from "node:crypto";

import { logger as defaultLogger } from "../lib/logger.js";

export const createRequestContext = ({ logger = defaultLogger } = {}) =>
  (req, res, next) => {
    const startedAt = process.hrtime.bigint();
    const requestId = randomUUID();

    req.id = requestId;
    res.setHeader("X-Request-ID", requestId);

    res.once("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      logger.info("http.request.completed", {
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
      });
    });

    next();
  };

