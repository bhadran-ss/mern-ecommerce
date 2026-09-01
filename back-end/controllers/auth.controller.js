import { getConfig } from "../config/env.js";
import { ApiError } from "../middleware/errors.js";
import User from "../models/user.model.js";
import { authSessionStore } from "../utils/auth-session.service.js";
import { csrfTokenService } from "../utils/csrf.service.js";
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
  findById: (id) => User.findById(id).select("-password"),
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
  csrfTokens = csrfTokenService,
  refreshExpirationSeconds = config.jwe.refreshExpirationSeconds,
} = {}) => {
  const createSession = async (res, user) => {
    const { sessionId, familyId } = tokens.createSessionIdentifiers();
    const accessToken = await tokens.createAccessToken(user, { sessionId });
    const refreshToken = await tokens.createRefreshToken(user, {
      sessionId,
      familyId,
    });

    await sessions.create({
      userId: user._id?.toString() ?? user.id,
      sessionId,
      familyId,
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

  const logout = async (req, res, _next) => {
    const refreshToken = req.cookies?.refreshToken;
    cookies.clearSessionCookies(res);

    if (!refreshToken) {
      return res.status(200).json({ message: "User logged out successfully" });
    }

    let decoded;
    try {
      decoded = await tokens.decryptRefreshToken(refreshToken);
    } catch {
      return res.status(200).json({ message: "User logged out successfully" });
    }

    try {
      await sessions.revoke({
        userId: decoded.sub,
        sessionId: decoded.sid,
        familyId: decoded.fid,
      });
      return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
      return _next(error);
    }
  };

  const logoutAll = async (req, res, next) => {
    cookies.clearSessionCookies(res);

    try {
      const id = req.user?._id?.toString() ?? req.user?.id;
      if (!id) {
        return next(new ApiError(401, "UNAUTHORIZED", "Unauthorized"));
      }

      await sessions.revokeAll(id);
      return res.status(200).json({ message: "Logged out from all devices" });
    } catch (error) {
      return next(error);
    }
  };

  const getCsrfToken = (_req, res) => {
    const csrfToken = csrfTokens.createToken();
    cookies.setCsrfCookie(res, csrfToken);
    res.set("Cache-Control", "no-store");
    return res.status(200).json({ csrfToken });
  };

  const profile = (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "UNAUTHORIZED", "Unauthorized"));
    }

    return res.status(200).json({ user: req.user });
  };

  const refreshAccessToken = async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;

    try {
      if (!refreshToken) {
        cookies.clearSessionCookies(res);
        return next(
          new ApiError(401, "REFRESH_TOKEN_MISSING", "No refresh token provided"),
        );
      }

      let decoded;
      try {
        decoded = await tokens.decryptRefreshToken(refreshToken);
      } catch (error) {
        cookies.clearSessionCookies(res);
        const code =
          error.name === "TokenExpiredError"
            ? "REFRESH_TOKEN_EXPIRED"
            : "INVALID_REFRESH_TOKEN";
        return next(new ApiError(401, code, "Refresh session is invalid"));
      }

      const user = await users.findById(decoded.sub);
      if (!user || (user.accountStatus ?? "active") !== "active") {
        await sessions.revoke({
          userId: decoded.sub,
          sessionId: decoded.sid,
          familyId: decoded.fid,
        });
        cookies.clearSessionCookies(res);
        return next(new ApiError(401, "UNAUTHORIZED", "Unauthorized"));
      }

      const nextRefreshToken = await tokens.createRefreshToken(user, {
        sessionId: decoded.sid,
        familyId: decoded.fid,
      });
      const accessToken = await tokens.createAccessToken(user, {
        sessionId: decoded.sid,
      });
      const rotationResult = await sessions.rotate({
        userId: decoded.sub,
        sessionId: decoded.sid,
        familyId: decoded.fid,
        currentRefreshToken: refreshToken,
        nextRefreshToken,
        expiresInSeconds: refreshExpirationSeconds,
      });

      if (rotationResult !== "rotated") {
        cookies.clearSessionCookies(res);
        const code =
          rotationResult === "reused"
            ? "REFRESH_TOKEN_REUSED"
            : "INVALID_REFRESH_TOKEN";
        return next(new ApiError(401, code, "Refresh session is invalid"));
      }

      cookies.setSessionCookies(res, accessToken, nextRefreshToken);

      return res.status(200).json({
        message: "Token refreshed successfully",
        user: toPublicUser(user),
      });
    } catch (error) {
      return next(error);
    }
  };

  return Object.freeze({
    signup,
    login,
    logout,
    logoutAll,
    profile,
    getCsrfToken,
    refreshAccessToken,
  });
};

export default createAuthController();
