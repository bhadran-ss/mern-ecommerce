import User from "../models/user.model.js";
import { decryptAccessToken } from "../utils/token.service.js";
import { logger } from "../lib/logger.js";
import { ApiError } from "./errors.js";

export const protectRoute = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized. No token provided." });
  }

  try {
    const decoded = await decryptAccessToken(token);
    const user = await User.findById(decoded.sub).select("-password");

    if (!user || (user.accountStatus ?? "active") !== "active") {
      return next(new ApiError(401, "UNAUTHORIZED", "Unauthorized"));
    }

    req.user = user;
    next();
  } catch (error) {
    logger.warn("auth.access_token.rejected", {
      requestId: req.id,
      errorName: error.name,
    });

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }

    res.status(401).json({ message: "Invalid token" });
  }
};

