import { getConfig } from "../config/env.js";

const config = getConfig();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "strict",
  path: "/",
};

const ACCESS_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: config.jwe.accessExpirationSeconds * 1000,
};

const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: config.jwe.refreshExpirationSeconds * 1000,
};

export const getSessionCookies = (req) => ({
  accessToken: req.cookies?.accessToken,
  refreshToken: req.cookies?.refreshToken,
});

export const setAccessCookie = (res, accessToken) => {
  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
};

export const setRefreshCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
};

export const setSessionCookies = (res, accessToken, refreshToken) => {
  setAccessCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);
};

export const clearSessionCookies = (res) => {
  res.clearCookie("accessToken", ACCESS_COOKIE_OPTIONS);
  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
};
