import { getEnvironment } from "../config/env.js";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: getEnvironment().nodeEnv === "production",
  sameSite: "strict",
  path: "/",
});

const getAccessCookieOptions = () => ({
  ...getCookieOptions(),
  maxAge: 15 * 60 * 1000,
});

const getRefreshCookieOptions = () => ({
  ...getCookieOptions(),
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const getSessionCookies = (req) => ({
  accessToken: req.cookies?.accessToken,
  refreshToken: req.cookies?.refreshToken,
});

export const setAccessCookie = (res, accessToken) => {
  res.cookie("accessToken", accessToken, getAccessCookieOptions());
};

export const setRefreshCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());
};

export const setSessionCookies = (res, accessToken, refreshToken) => {
  setAccessCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);
};

export const clearSessionCookies = (res) => {
  res.clearCookie("accessToken", getAccessCookieOptions());
  res.clearCookie("refreshToken", getRefreshCookieOptions());
};
