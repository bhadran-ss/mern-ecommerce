import { AppError } from "../utils/app-error.js";

const normalizeError = (error) => {
  if (error instanceof AppError) {
    return error;
  }

  if (error?.name === "ValidationError") {
    return new AppError(400, "VALIDATION_ERROR", "Request validation failed.", {
      details: Object.values(error.errors || {}).map((item) => item.message),
      cause: error,
    });
  }

  if (error?.name === "CastError") {
    return new AppError(400, "INVALID_IDENTIFIER", "A resource identifier is invalid.", {
      cause: error,
    });
  }

  if (error?.code === 11000) {
    return new AppError(409, "DUPLICATE_RESOURCE", "The resource already exists.", {
      cause: error,
    });
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return new AppError(400, "INVALID_JSON", "The request body contains invalid JSON.", {
      cause: error,
    });
  }

  return new AppError(500, "INTERNAL_SERVER_ERROR", "An unexpected server error occurred.", {
    cause: error,
  });
};

export const notFoundHandler = (req, _res, next) => {
  next(new AppError(404, "ROUTE_NOT_FOUND", "The requested API route was not found."));
};

export const createErrorHandler = ({ logger }) =>
  (error, req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }

    const normalized = normalizeError(error);
    const logContext = {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: normalized.statusCode,
      error:
        normalized.statusCode >= 500
          ? error
          : { name: normalized.name, code: normalized.code },
    };
    if (normalized.statusCode >= 500) {
      logger.error("API request failed", logContext);
    } else {
      logger.warn("API request rejected", logContext);
    }

    const response = {
      success: false,
      error: {
        code: normalized.code,
        message: normalized.message,
      },
      requestId: req.requestId,
    };

    if (normalized.details) {
      response.error.details = normalized.details;
    }
    return res.status(normalized.statusCode).json(response);
  };
