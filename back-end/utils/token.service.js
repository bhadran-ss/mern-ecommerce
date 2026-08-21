import * as jose from "jose";
import { createHash, randomUUID } from "crypto";
import { getEnvironment } from "../config/env.js";

const toSeconds = (duration) => {
  const source = String(duration).trim();
  const match = /^([0-9]+)([smhd])$/.exec(source);
  if (!match) {
    throw new Error(`Invalid token expiration format: ${duration}`);
  }

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 24 * 60 * 60;
    default:
      throw new Error(`Unsupported expiration unit: ${unit}`);
  }
};

const getSecretKey = (secret, name) => {
  if (!secret) {
    throw new Error(`${name} must be defined in environment variables`);
  }
  return createHash("sha256").update(secret).digest();
};

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
  const config = getEnvironment();
  const secret = getSecretKey(config.jweSecret, "JWE_SECRET");
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user._id?.toString(),
    role: user.role || "customer",
    sid: randomUUID(),
    iat: now,
    exp: now + toSeconds(config.jweAccessExpiration),
  };

  return encryptPayload(payload, secret);
};

export const createRefreshToken = async (user) => {
  const config = getEnvironment();
  const secret = getSecretKey(config.jweRefreshSecret, "JWE_REFRESH_SECRET");
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user._id?.toString(),
    role: user.role || "customer",
    sid: randomUUID(),
    iat: now,
    exp: now + toSeconds(config.jweRefreshExpiration),
  };

  return encryptPayload(payload, secret);
};

export const decryptAccessToken = async (token) => {
  const secret = getSecretKey(getEnvironment().jweSecret, "JWE_SECRET");
  return decryptPayload(token, secret);
};

export const decryptRefreshToken = async (token) => {
  const secret = getSecretKey(
    getEnvironment().jweRefreshSecret,
    "JWE_REFRESH_SECRET",
  );
  return decryptPayload(token, secret);
};
