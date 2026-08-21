import { randomUUID } from "node:crypto";

export const requestContext = (req, res, next) => {
  const suppliedRequestId = req.get("x-request-id");
  req.requestId = /^[A-Za-z0-9._-]{1,128}$/.test(suppliedRequestId || "")
    ? suppliedRequestId
    : randomUUID();
  res.set("x-request-id", req.requestId);
  next();
};

export const createRequestLogger = (logger) => (req, res, next) => {
  const startedAt = process.hrtime.bigint();
  const requestPath = req.path;

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    logger.info("HTTP request completed", {
      requestId: req.requestId,
      method: req.method,
      path: requestPath,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
    });
  });

  next();
};
