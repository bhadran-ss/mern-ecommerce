import { logger as defaultLogger } from "../lib/logger.js";

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const normalizeError = (error) => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error?.type === "entity.too.large") {
    return new ApiError(413, "PAYLOAD_TOO_LARGE", "Request body is too large");
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return new ApiError(400, "INVALID_JSON", "Request body contains invalid JSON");
  }

  return new ApiError(500, "INTERNAL_ERROR", "Internal server error");
};

export const notFoundHandler = (req, _res, next) => {
  next(new ApiError(404, "ROUTE_NOT_FOUND", "Route not found"));
};

const defaultMessages = Object.freeze({
  400: "Bad request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not found",
  409: "Conflict",
  413: "Request body is too large",
  429: "Too many requests",
});

const defaultCodes = Object.freeze({
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  413: "PAYLOAD_TOO_LARGE",
  429: "RATE_LIMIT_EXCEEDED",
});

export const createErrorResponseNormalizer = ({ logger = defaultLogger } = {}) =>
  (req, res, next) => {
    const sendJson = res.json.bind(res);

    res.json = (body) => {
      if (res.statusCode < 400 || body?.error?.code) {
        return sendJson(body);
      }

      const isInternalError = res.statusCode >= 500;
      const suppliedMessage =
        typeof body?.message === "string"
          ? body.message
          : typeof body?.error === "string"
            ? body.error
            : undefined;
      const message = isInternalError
        ? "Internal server error"
        : suppliedMessage || defaultMessages[res.statusCode] || "Request failed";
      const code = isInternalError
        ? "INTERNAL_ERROR"
        : defaultCodes[res.statusCode] || "REQUEST_FAILED";

      if (isInternalError) {
        logger.error("http.legacy_error_response", {
          requestId: req.id,
          method: req.method,
          path: req.path,
          cause: body?.error,
        });
      }

      return sendJson({
        message,
        error: {
          code,
          message,
          requestId: req.id,
        },
      });
    };

    next();
  };

export const createErrorHandler = ({ logger = defaultLogger } = {}) =>
  (error, req, res, _next) => {
    const apiError = normalizeError(error);

    if (apiError.status >= 500) {
      logger.error("http.request.failed", {
        requestId: req.id,
        method: req.method,
        path: req.path,
        error,
      });
    }

    if (res.headersSent) {
      return;
    }

    res.status(apiError.status).json({
      message: apiError.message,
      error: {
        code: apiError.code,
        message: apiError.message,
        requestId: req.id,
      },
    });
  };
