import { ApiError } from "./errors.js";

export const requireRole = (...roles) => {
  const allowedRoles = new Set(roles);

  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "UNAUTHORIZED", "Unauthorized"));
    }

    if (allowedRoles.size === 0 || allowedRoles.has(req.user.role)) {
      return next();
    }

    return next(
      new ApiError(403, "FORBIDDEN", "Forbidden. Insufficient permissions."),
    );
  };
};

export const authorize = requireRole;
export const requireCustomer = requireRole("customer");
export const requireSeller = requireRole("seller", "admin");
export const requireAdministrator = requireRole("admin");
