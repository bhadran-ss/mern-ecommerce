import redis from "../lib/Redis.js";
import User from "../models/user.model.js";
import {
  createAccessToken,
  createRefreshToken,
  decryptRefreshToken,
} from "../utils/token.service.js";
import {
  setSessionCookies,
  setAccessCookie,
  clearSessionCookies,
} from "../utils/session.service.js";
import { ApiError } from "../middleware/errors.js";

const signup = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return next(new ApiError(400, "VALIDATION_ERROR", "All fields are required."));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(400, "USER_EXISTS", "User already exists."));
  }

  const safeRole = role === "seller" ? "seller" : "customer";
  const user = new User({ name, email, password, role: safeRole });
  try {
    await user.save();

    const accessToken = await createAccessToken(user);
    const refreshToken = await createRefreshToken(user);

    await redis.set(
      `refresh_token:${user._id}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60,
    ); // 7 days

    setSessionCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
};
const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, "VALIDATION_ERROR", "All fields are required."));
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ApiError(400, "INVALID_CREDENTIALS", "Invalid credentials."));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ApiError(400, "INVALID_CREDENTIALS", "Invalid credentials."));
    }

    const accessToken = await createAccessToken(user);
    const refreshToken = await createRefreshToken(user);

    await redis.set(
      `refresh_token:${user._id}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60,
    ); // 7 days

    setSessionCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
};
const logout = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return next(new ApiError(400, "SESSION_MISSING", "No refresh token found."));
  }

  try {
    const decoded = await decryptRefreshToken(refreshToken);
    await redis.del(`refresh_token:${decoded.sub}`);
    clearSessionCookies(res);
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    return next(error);
  }
};
const profile = (req, res, next) => {
  const user = req.user;
  if (!user) {
    return next(new ApiError(401, "UNAUTHORIZED", "Authentication required."));
  }
  res.status(200).json({ user });
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return next(new ApiError(401, "SESSION_MISSING", "No refresh token provided."));
    }

    const decoded = await decryptRefreshToken(refreshToken);
    const storedRefreshToken = await redis.get(`refresh_token:${decoded.sub}`);
    if (storedRefreshToken !== refreshToken) {
      return next(new ApiError(401, "INVALID_SESSION", "Session is invalid or expired."));
    }

    const accessToken = await createAccessToken({
      _id: decoded.sub,
      role: decoded.role,
    });
    setAccessCookie(res, accessToken);

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    return next(error);
  }
};
const authcontroller = {
  signup,
  login,
  logout,
  profile,
  refreshAccessToken,
};
export default authcontroller;
