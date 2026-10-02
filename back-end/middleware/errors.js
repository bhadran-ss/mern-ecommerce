export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, "NOT_FOUND", "API endpoint not found."));
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const parserStatus =
    error?.type === "entity.too.large"
      ? 413
      : error?.type === "entity.parse.failed"
        ? 400
        : null;
  const status = error instanceof ApiError
    ? error.status
    : error?.name === "TokenExpiredError"
      ? 401
      : parserStatus || (error?.status === 413 ? 413 : 500);
  const isExpected = error instanceof ApiError;
  const code = isExpected
    ? error.code
    : error?.name === "TokenExpiredError"
      ? "SESSION_EXPIRED"
    : status === 413
      ? "PAYLOAD_TOO_LARGE"
      : status === 400
        ? "BAD_REQUEST"
        : "INTERNAL_ERROR";
  const message = isExpected
    ? error.message
    : error?.name === "TokenExpiredError"
      ? "Session is invalid or expired."
    : status === 413
      ? "Request body exceeds the allowed size."
      : status === 400
        ? "Invalid request body."
        : "Internal server error.";

  if (status >= 500) {
    req.app.locals.logger.error("request.failed", {
      requestId: req.id,
      status,
      errorName: error?.name || "Error",
    });
  }

  return res.status(status).json({
    error: { code, message },
    requestId: req.id,
  });
};
