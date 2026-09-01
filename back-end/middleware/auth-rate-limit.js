import rateLimit from "express-rate-limit";

import { ApiError } from "./errors.js";

export const createAuthRateLimit = ({
  windowMs,
  limit,
  code,
  message,
  skipSuccessfulRequests = false,
}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (_req, _res, next) =>
      next(new ApiError(429, code, message)),
  });

export const registrationRateLimit = createAuthRateLimit({
  windowMs: 60 * 60 * 1_000,
  limit: 5,
  code: "REGISTRATION_RATE_LIMITED",
  message: "Too many registration attempts; please try again later",
});

export const loginRateLimit = createAuthRateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 10,
  code: "LOGIN_RATE_LIMITED",
  message: "Too many login attempts; please try again later",
  skipSuccessfulRequests: true,
});

export const refreshRateLimit = createAuthRateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 30,
  code: "REFRESH_RATE_LIMITED",
  message: "Too many refresh attempts; please sign in again",
});
