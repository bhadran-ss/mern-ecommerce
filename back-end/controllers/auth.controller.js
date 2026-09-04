import redis from "../lib/Redis.js";
import User from "../models/user.model.js";
import {
  createAccessToken,
  createRefreshToken,
  decryptAccessToken,
  decryptRefreshToken,
} from "../utils/token.service.js";
import {
  setSessionCookies,
  setAccessCookie,
  clearSessionCookies,
} from "../utils/session.service.js";
import { ApiError } from "../middleware/errors.js";
import config from "../config/env.js";

const isValidEmail = (email) =>
  typeof email === "string" &&
  email.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidRegistrationPassword = (password) =>
  typeof password === "string" &&
  Array.from(password).length >= 12 &&
  Buffer.byteLength(password, "utf8") <= 72;

const invalidCredentials = (next) =>
  next(new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password."));

const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
});

const signup = async (req, res, next) => {
  const { name, email, password, role } = req.body ?? {};
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedName = typeof name === "string" ? name.trim() : "";

  if (
    normalizedName.length < 2 ||
    normalizedName.length > 100 ||
    !isValidEmail(normalizedEmail) ||
    !isValidRegistrationPassword(password)
  ) {
    return next(
      new ApiError(
        400,
        "VALIDATION_ERROR",
        "Provide a name, valid email, and password with at least 12 characters and no more than 72 UTF-8 bytes.",
      ),
    );
  }

  if (role === "seller" || role === "admin") {
    return next(
      new ApiError(
        403,
        "FORBIDDEN",
        "Seller and administrator roles cannot be assigned during signup.",
      ),
    );
  }
  if (role !== undefined && role !== "customer") {
    return next(new ApiError(400, "VALIDATION_ERROR", "Role must be customer."));
  }

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(new ApiError(409, "USER_EXISTS", "An account with this email already exists."));
    }

    const user = new User({
      name: normalizedName,
      email: normalizedEmail,
      password,
      role: "customer",
    });
    await user.save();

    const accessToken = await createAccessToken(user);
    const refreshToken = await createRefreshToken(user);

    await redis.set(
      `refresh_token:${user._id}`,
      refreshToken,
      "EX",
      Math.ceil(config.REFRESH_TOKEN_MAX_AGE_MS / 1000),
    );

    setSessionCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: publicUser(user),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return next(new ApiError(409, "USER_EXISTS", "An account with this email already exists."));
    }
    return next(error);
  }
};
const login = async (req, res, next) => {
  const { email, password } = req.body ?? {};
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (
    !isValidEmail(normalizedEmail) ||
    typeof password !== "string" ||
    password.length === 0 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return invalidCredentials(next);
  }

  try {
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return invalidCredentials(next);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return invalidCredentials(next);
    }

    const accessToken = await createAccessToken(user);
    const refreshToken = await createRefreshToken(user);

    await redis.set(
      `refresh_token:${user._id}`,
      refreshToken,
      "EX",
      Math.ceil(config.REFRESH_TOKEN_MAX_AGE_MS / 1000),
    );

    setSessionCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
};
const logout = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;
  const accessToken = req.cookies?.accessToken;
  clearSessionCookies(res);

  let userId;
  const tokenCandidates = [
    ...(refreshToken ? [[refreshToken, decryptRefreshToken]] : []),
    ...(accessToken ? [[accessToken, decryptAccessToken]] : []),
  ];
  for (const [token, decrypt] of tokenCandidates) {
    try {
      const decoded = await decrypt(token);
      if (typeof decoded.sub === "string" && decoded.sub) {
        userId = decoded.sub;
        break;
      }
    } catch {
      // Try the other cookie before treating logout as an already-ended session.
    }
  }

  if (userId) {
    try {
      await redis.del(`refresh_token:${userId}`);
    } catch (error) {
      return next(error);
    }
  }

  return res.status(200).json({ message: "User logged out successfully" });
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
      clearSessionCookies(res);
      return next(new ApiError(401, "SESSION_MISSING", "No refresh token provided."));
    }

    let decoded;
    try {
      decoded = await decryptRefreshToken(refreshToken);
    } catch {
      clearSessionCookies(res);
      return next(
        new ApiError(401, "INVALID_SESSION", "Session is invalid or expired."),
      );
    }

    const storedRefreshToken = await redis.get(`refresh_token:${decoded.sub}`);
    if (storedRefreshToken !== refreshToken) {
      clearSessionCookies(res);
      return next(new ApiError(401, "INVALID_SESSION", "Session is invalid or expired."));
    }

    const user = await User.findById(decoded.sub).select("-password");
    if (!user) {
      clearSessionCookies(res);
      return next(new ApiError(401, "INVALID_SESSION", "Session is invalid or expired."));
    }

    const accessToken = await createAccessToken(user);
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
