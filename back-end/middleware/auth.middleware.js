import User from "../models/user.model.js";
import { decryptAccessToken } from "../utils/token.service.js";
import { logger } from "../lib/logger.js";
import { ApiError } from "./errors.js";

export const protectRoute = async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return next(new ApiError(401, "UNAUTHORIZED", "Unauthorized"));
  }

  try {
    const decoded = await decryptAccessToken(token);
    const user = await User.findById(decoded.sub).select("-password");

    if (!user || (user.accountStatus ?? "active") !== "active") {
      return next(new ApiError(401, "UNAUTHORIZED", "Unauthorized"));
    }

    req.user = user;
    req.auth = { sessionId: decoded.sid };
    return next();
  } catch (error) {
    logger.warn("auth.access_token.rejected", {
      requestId: req.id,
      errorName: error.name,
    });

    if (error.name === "TokenExpiredError") {
      return next(
        new ApiError(401, "ACCESS_TOKEN_EXPIRED", "Access token expired"),
      );
    }

    return next(new ApiError(401, "INVALID_ACCESS_TOKEN", "Invalid token"));
  }
};

