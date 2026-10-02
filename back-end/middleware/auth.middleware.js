import User from "../models/user.model.js";
import { decryptAccessToken } from "../utils/token.service.js";
import { ApiError } from "./errors.js";

export const protectRoute = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return next(new ApiError(401, "UNAUTHORIZED", "Authentication required."));
  }

  let decoded;
  try {
    decoded = await decryptAccessToken(token);
  } catch (error) {
    return next(
      new ApiError(401, "INVALID_SESSION", "Session is invalid or expired."),
    );
  }

  try {
    const user = await User.findById(decoded.sub).select("-password");
    if (!user) {
      return next(new ApiError(401, "INVALID_SESSION", "Session is invalid or expired."));
    }
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

