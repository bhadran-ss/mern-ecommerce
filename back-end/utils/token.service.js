import * as jose from "jose";
import { createHash, randomUUID } from "crypto";
import { getConfig } from "../config/env.js";

const config = getConfig().jwe;

const ACCESS_TOKEN_SECRET = createHash("sha256")
  .update(config.accessSecret)
  .digest();
const REFRESH_TOKEN_SECRET = createHash("sha256")
  .update(config.refreshSecret)
  .digest();

const encryptPayload = async (payload, secret) => {
  const encoder = new TextEncoder();
  return await new jose.CompactEncrypt(encoder.encode(JSON.stringify(payload)))
    .setProtectedHeader({ alg: "A256GCMKW", enc: "A256GCM" })
    .encrypt(secret);
};

const decryptPayload = async (token, secret) => {
  const { plaintext } = await jose.compactDecrypt(token, secret);
  const payload = JSON.parse(new TextDecoder().decode(plaintext));

  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid token payload");
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number") {
    throw new Error("Token payload missing expiration");
  }

  if (payload.exp <= now) {
    const error = new Error("Token expired");
    error.name = "TokenExpiredError";
    throw error;
  }

  return payload;
};

export const createAccessToken = async (user) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user._id?.toString(),
    role: user.role || "customer",
    sid: randomUUID(),
    iat: now,
    exp: now + config.accessExpirationSeconds,
  };

  return encryptPayload(payload, ACCESS_TOKEN_SECRET);
};

export const createRefreshToken = async (user) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user._id?.toString(),
    role: user.role || "customer",
    sid: randomUUID(),
    iat: now,
    exp: now + config.refreshExpirationSeconds,
  };

  return encryptPayload(payload, REFRESH_TOKEN_SECRET);
};

export const decryptAccessToken = async (token) => {
  return decryptPayload(token, ACCESS_TOKEN_SECRET);
};

export const decryptRefreshToken = async (token) => {
  return decryptPayload(token, REFRESH_TOKEN_SECRET);
};
