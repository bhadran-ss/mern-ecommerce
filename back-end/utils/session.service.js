import dotenv from "dotenv";

dotenv.config({ quiet: true });

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

const ACCESS_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
