import User from "../models/user.model.js";
import { AppError } from "../utils/app-error.js";
import { decryptAccessToken } from "../utils/token.service.js";

export const protectRoute = async (req, _res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return next(
      new AppError(401, "AUTHENTICATION_REQUIRED", "Authentication is required."),
    );
  }

  try {
    const decoded = await decryptAccessToken(token);
    const user = await User.findById(decoded.sub).select("-password");
    if (!user) {
      throw new AppError(401, "USER_NOT_FOUND", "The authenticated user was not found.");
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if (error.name === "TokenExpiredError") {
      return next(
        new AppError(401, "ACCESS_TOKEN_EXPIRED", "Access token expired.", {
          cause: error,
        }),
      );
    }
    return next(
      new AppError(401, "INVALID_ACCESS_TOKEN", "Invalid access token.", {
        cause: error,
      }),
    );
  }
};
