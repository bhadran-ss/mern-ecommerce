import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import redis from "../lib/Redis.js";
import User from "../models/user.model.js";
import { SendTokenWithCookie } from "../utils/jwt.js";
dotenv.config({ quiet: true });
const signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = new User({ name, email, password });
  try {
    await user.save();
    await SendTokenWithCookie(res, user, "User registered successfully");
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
    const isMatch = await user.comparePassword(password);
    if (user && isMatch) {
			    SendTokenWithCookie(res, user, "User logged in successfully");
		}
	} catch (error) {
		res.status(500).json({ message: "Error logging in", error });
	}
};
const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log("Refresh Token:", refreshToken);
  if (refreshToken) {
    try {
      const decorded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      await redis.del(`refresh_token:${decorded.userId}`);
      res
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .status(200)
        .json({ message: "User logged out successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Error logging out", error });
    }
  } else {
    console.log("No refresh token found");
    return res.status(400).json({ message: "No refresh token found" });
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
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const storedRefreshToken = await redis.get(
      `refresh_token:${decoded.userId}`
    );
    if (storedRefreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.log("Error in refreshToken controller", error.message);
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
