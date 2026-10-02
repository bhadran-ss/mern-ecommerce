import config from "../config/env.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

const ACCESS_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: config.ACCESS_TOKEN_MAX_AGE_MS,
};

const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: config.REFRESH_TOKEN_MAX_AGE_MS,
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
