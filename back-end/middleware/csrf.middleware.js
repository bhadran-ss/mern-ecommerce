import { csrfTokenService } from "../utils/csrf.service.js";
import { ApiError } from "./errors.js";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export const createCsrfProtection = ({ tokens = csrfTokenService } = {}) =>
  (req, _res, next) => {
    if (safeMethods.has(req.method)) {
      return next();
    }

    const cookieToken = req.cookies?.csrfToken;
    const headerToken = req.get("X-CSRF-Token");
    if (
      !cookieToken ||
      !headerToken ||
      cookieToken !== headerToken ||
      !tokens.verifyToken(cookieToken)
    ) {
      return next(
        new ApiError(403, "CSRF_TOKEN_INVALID", "CSRF token is missing or invalid"),
      );
    }

    return next();
  };

export const csrfProtection = createCsrfProtection();
