import { getConfig } from "../config/env.js";

const config = getConfig();

export const createSessionCookieService = (applicationConfig) => {
  const sharedOptions = Object.freeze({
    httpOnly: true,
    secure: applicationConfig.nodeEnv === "production",
    sameSite: "lax",
  });
  const accessCookieOptions = Object.freeze({
    ...sharedOptions,
    path: "/",
    maxAge: applicationConfig.jwe.accessExpirationSeconds * 1000,
  });
  const refreshCookieOptions = Object.freeze({
    ...sharedOptions,
    path: "/api/auth",
    maxAge: applicationConfig.jwe.refreshExpirationSeconds * 1000,
  });
  const accessClearOptions = Object.freeze({
    ...sharedOptions,
    path: "/",
  });
  const refreshClearOptions = Object.freeze({
    ...sharedOptions,
    path: "/api/auth",
  });

  return Object.freeze({
    setAccessCookie: (res, accessToken) => {
      res.cookie("accessToken", accessToken, accessCookieOptions);
    },
    setRefreshCookie: (res, refreshToken) => {
      res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    },
    setSessionCookies: (res, accessToken, refreshToken) => {
      res.cookie("accessToken", accessToken, accessCookieOptions);
      res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    },
    clearSessionCookies: (res) => {
      res.clearCookie("accessToken", accessClearOptions);
      res.clearCookie("refreshToken", refreshClearOptions);
    },
  });
};

const sessionCookieService = createSessionCookieService(config);

export const getSessionCookies = (req) => ({
  accessToken: req.cookies?.accessToken,
  refreshToken: req.cookies?.refreshToken,
});

export const setAccessCookie = (res, accessToken) => {
  sessionCookieService.setAccessCookie(res, accessToken);
};

export const setRefreshCookie = (res, refreshToken) => {
  sessionCookieService.setRefreshCookie(res, refreshToken);
};

export const setSessionCookies = (res, accessToken, refreshToken) => {
  sessionCookieService.setSessionCookies(res, accessToken, refreshToken);
};

export const clearSessionCookies = (res) => {
  sessionCookieService.clearSessionCookies(res);
};
