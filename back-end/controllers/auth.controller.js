import { getRedisClient } from "../lib/Redis.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/app-error.js";
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

const signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    throw new AppError(400, "REQUIRED_FIELDS_MISSING", "All fields are required.");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(409, "USER_ALREADY_EXISTS", "User already exists.");
  }

  const safeRole = role === "seller" ? "seller" : "customer";
  const user = new User({ name, email, password, role: safeRole });
  await user.save();

  const accessToken = await createAccessToken(user);
  const refreshToken = await createRefreshToken(user);
  await getRedisClient().set(
    `refresh_token:${user._id}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60,
  );
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
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError(400, "REQUIRED_FIELDS_MISSING", "All fields are required.");
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid credentials.");
  }

  const accessToken = await createAccessToken(user);
  const refreshToken = await createRefreshToken(user);
  await getRedisClient().set(
    `refresh_token:${user._id}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60,
  );
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
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError(400, "REFRESH_TOKEN_MISSING", "No refresh token found.");
  }

  const decoded = await decryptRefreshToken(refreshToken);
  await getRedisClient().del(`refresh_token:${decoded.sub}`);
  clearSessionCookies(res);
  return res.status(200).json({ message: "User logged out successfully" });
};

const profile = (req, res) =>
  res.status(200).json({ user: req.user });

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError(401, "REFRESH_TOKEN_MISSING", "No refresh token provided.");
  }

  try {
    const decoded = await decryptRefreshToken(refreshToken);
    const storedRefreshToken = await getRedisClient().get(
      `refresh_token:${decoded.sub}`,
    );
    if (storedRefreshToken !== refreshToken) {
      throw new AppError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token.");
    }

    const accessToken = await createAccessToken({
      _id: decoded.sub,
      role: decoded.role,
    });
    setAccessCookie(res, accessToken);
    return res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error.name === "TokenExpiredError") {
      throw new AppError(401, "REFRESH_TOKEN_EXPIRED", "Refresh token expired.", {
        cause: error,
      });
    }
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token.", {
      cause: error,
    });
  }
};

export default { signup, login, logout, profile, refreshAccessToken };
