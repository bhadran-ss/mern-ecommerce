import dotenv from "dotenv";
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

dotenv.config({ quiet: true });
const signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
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
    res.status(500).json({ message: "Error creating user", error });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
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
    res.status(500).json({ message: "Error logging in", error });
  }
};
const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({ message: "No refresh token found" });
  }

  try {
    const decoded = await decryptRefreshToken(refreshToken);
    await redis.del(`refresh_token:${decoded.sub}`);
    clearSessionCookies(res);
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error logging out", error });
  }
};
const profile = (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.status(200).json({ user });
};

const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = await decryptRefreshToken(refreshToken);
    const storedRefreshToken = await redis.get(`refresh_token:${decoded.sub}`);
    if (storedRefreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = await createAccessToken({
      _id: decoded.sub,
      role: decoded.role,
    });
    setAccessCookie(res, accessToken);

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.log("Error in refreshToken controller", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Refresh token expired" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
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
