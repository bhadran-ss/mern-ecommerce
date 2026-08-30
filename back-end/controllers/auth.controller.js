import { getConfig } from "../config/env.js";
import { ApiError } from "../middleware/errors.js";
import User from "../models/user.model.js";
import { authSessionStore } from "../utils/auth-session.service.js";
import { verifyPassword } from "../utils/password.service.js";
import * as cookieService from "../utils/session.service.js";
import * as tokenService from "../utils/token.service.js";
import {
  hasValidationIssues,
  validateLoginInput,
  validateRegistrationInput,
} from "../validation/auth.validation.js";

const config = getConfig();

const userRepository = Object.freeze({
  findByEmail: (email, { includePassword = false } = {}) => {
    const query = User.findOne({ email });
    return includePassword ? query.select("+password") : query;
  },
  create: async (attributes) => {
    const user = new User(attributes);
    await user.save();
    return user;
  },
});

const toPublicUser = (user) => ({
  id: user._id?.toString() ?? user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  accountStatus: user.accountStatus ?? "active",
});

const validationError = (message, issues) =>
  new ApiError(400, "VALIDATION_ERROR", message, { fields: issues });

const invalidCredentialsError = () =>
  new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");

export const createAuthController = ({
  users = userRepository,
  sessions = authSessionStore,
  tokens = tokenService,
  cookies = cookieService,
  passwordVerifier = verifyPassword,
  refreshExpirationSeconds = config.jwe.refreshExpirationSeconds,
} = {}) => {
  const createSession = async (res, user) => {
    const accessToken = await tokens.createAccessToken(user);
    const refreshToken = await tokens.createRefreshToken(user);

    await sessions.create({
      userId: user._id?.toString() ?? user.id,
      refreshToken,
      expiresInSeconds: refreshExpirationSeconds,
    });
    cookies.setSessionCookies(res, accessToken, refreshToken);
  };

  const signup = async (req, res, next) => {
    try {
      const { value, issues } = validateRegistrationInput(req.body);
      if (hasValidationIssues(issues)) {
        return next(validationError("Registration data is invalid", issues));
      }

      const existingUser = await users.findByEmail(value.email);
      if (existingUser) {
        return next(
          new ApiError(
            409,
            "EMAIL_UNAVAILABLE",
            "An account cannot be created with this email",
          ),
        );
      }

      const user = await users.create({
        ...value,
        role: "customer",
        accountStatus: "active",
      });
      await createSession(res, user);

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: toPublicUser(user),
      });
    } catch (error) {
      if (error?.code === 11000) {
        return next(
          new ApiError(
            409,
            "EMAIL_UNAVAILABLE",
            "An account cannot be created with this email",
          ),
        );
      }

      return next(error);
    }
  };

  const login = async (req, res, next) => {
    try {
      const { value, issues } = validateLoginInput(req.body);
      if (hasValidationIssues(issues)) {
        return next(validationError("Login data is invalid", issues));
      }

      const user = await users.findByEmail(value.email, {
        includePassword: true,
      });
      const passwordMatches = await passwordVerifier(
        value.password,
        user?.password,
      );
      const accountIsActive = (user?.accountStatus ?? "active") === "active";

      if (!user || !passwordMatches || !accountIsActive) {
        return next(invalidCredentialsError());
      }

      await createSession(res, user);

      return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        user: toPublicUser(user),
      });
    } catch (error) {
      return next(error);
    }
  };

  const logout = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return next(new ApiError(400, "REFRESH_TOKEN_MISSING", "No refresh token found"));
    }

    try {
      const decoded = await tokens.decryptRefreshToken(refreshToken);
      await sessions.remove(decoded.sub);
      cookies.clearSessionCookies(res);
      return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
      return next(error);
    }
  };

  const profile = (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "UNAUTHORIZED", "Unauthorized"));
    }

    return res.status(200).json({ user: req.user });
  };

  const refreshAccessToken = async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return next(
          new ApiError(401, "REFRESH_TOKEN_MISSING", "No refresh token provided"),
        );
      }

      const decoded = await tokens.decryptRefreshToken(refreshToken);
      const storedRefreshToken = await sessions.get(decoded.sub);
      if (storedRefreshToken !== refreshToken) {
        return next(new ApiError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token"));
      }

      const accessToken = await tokens.createAccessToken({
        _id: decoded.sub,
        role: decoded.role,
      });
      cookies.setAccessCookie(res, accessToken);

      return res.status(200).json({ message: "Token refreshed successfully" });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return next(
          new ApiError(401, "REFRESH_TOKEN_EXPIRED", "Refresh token expired"),
        );
      }
      return next(error);
    }
  };

  return Object.freeze({
    signup,
    login,
    logout,
    profile,
    refreshAccessToken,
  });
};

export default createAuthController();
