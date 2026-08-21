import { AppError } from "../utils/app-error.js";

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(
      new AppError(401, "AUTHENTICATION_REQUIRED", "Authentication is required."),
    );
  }

  if (
    roles.length === 0 ||
    req.user.role === "admin" ||
    roles.includes(req.user.role)
  ) {
    return next();
  }

  return next(
    new AppError(403, "INSUFFICIENT_PERMISSIONS", "Insufficient permissions."),
  );
};
