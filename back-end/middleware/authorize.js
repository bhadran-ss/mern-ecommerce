import { ApiError } from "./errors.js";

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "UNAUTHORIZED", "Authentication required."));
    }

    if (roles.length === 0) {
      return next();
    }

    if (req.user.role === "admin" || roles.includes(req.user.role)) {
      return next();
    }

    return next(new ApiError(403, "FORBIDDEN", "Insufficient permissions."));
  };
};
