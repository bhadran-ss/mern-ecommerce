import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

const environmentFile = fileURLToPath(new URL("../../.env", import.meta.url));

dotenv.config({ path: environmentFile, quiet: true });

const allowedNodeEnvironments = new Set(["development", "test", "production"]);
const durationPattern = /^([1-9][0-9]*)([smhd])$/;

export class ConfigurationError extends Error {
  constructor(issues) {
    super(`Invalid environment configuration:\n- ${issues.join("\n- ")}`);
    this.name = "ConfigurationError";
    this.issues = [...issues];
  }
}

const durationToSeconds = (duration) => {
  const match = durationPattern.exec(duration);
  if (!match) {
    return null;
  }

  const value = Number(match[1]);
  const multipliers = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };
  const seconds = value * multipliers[match[2]];

  return Number.isSafeInteger(seconds) ? seconds : null;
};

export const validateEnvironment = (environment) => {
  const issues = [];

  const requiredString = (name) => {
    const value = environment[name];
    if (typeof value !== "string" || value.trim() === "") {
      issues.push(`${name} is required`);
      return "";
    }
    return value.trim();
  };

  const requiredUrl = (name, protocols) => {
    const value = requiredString(name);
    if (!value) {
      return "";
    }

    try {
      const parsed = new URL(value);
      if (!protocols.includes(parsed.protocol)) {
        issues.push(`${name} must use one of: ${protocols.join(", ")}`);
      }
    } catch {
      issues.push(`${name} must be a valid URL`);
    }

    return value;
  };

  const requiredSecret = (name, minimumLength) => {
    const value = requiredString(name);
    if (value && value.length < minimumLength) {
      issues.push(`${name} must be at least ${minimumLength} characters long`);
    }
    return value;
  };

  const nodeEnv = requiredString("NODE_ENV");
  if (nodeEnv && !allowedNodeEnvironments.has(nodeEnv)) {
    issues.push("NODE_ENV must be development, test, or production");
  }

  const portSource = requiredString("PORT");
  const port = Number(portSource);
  if (
    portSource &&
    (!/^[0-9]+$/.test(portSource) ||
      !Number.isInteger(port) ||
      port < 1 ||
      port > 65535)
  ) {
    issues.push("PORT must be an integer between 1 and 65535");
  }

  const clientUrl = requiredUrl("CLIENT_URL", ["http:", "https:"]);
  const mongoUri = requiredUrl("MONGO_URI", ["mongodb:", "mongodb+srv:"]);
  const redisUrl = requiredUrl("UPSTASH_REDIS_URL", ["redis:", "rediss:"]);

  const accessSecret = requiredSecret("JWE_SECRET", 32);
  const refreshSecret = requiredSecret("JWE_REFRESH_SECRET", 32);
  if (accessSecret && refreshSecret && accessSecret === refreshSecret) {
    issues.push("JWE_SECRET and JWE_REFRESH_SECRET must be different");
  }

  const accessExpiration = requiredString("JWE_ACCESS_EXPIRATION");
  const accessExpirationSeconds = durationToSeconds(accessExpiration);
  if (accessExpiration && accessExpirationSeconds === null) {
    issues.push(
      "JWE_ACCESS_EXPIRATION must use a positive duration such as 15m",
    );
  }

  const refreshExpiration = requiredString("JWE_REFRESH_EXPIRATION");
  const refreshExpirationSeconds = durationToSeconds(refreshExpiration);
  if (refreshExpiration && refreshExpirationSeconds === null) {
    issues.push(
      "JWE_REFRESH_EXPIRATION must use a positive duration such as 7d",
    );
  }

  const cloudName = requiredString("CLOUDINARY_CLOUD_NAME");
  const cloudinaryApiKey = requiredString("CLOUDINARY_API_KEY");
  const cloudinaryApiSecret = requiredString("CLOUDINARY_API_SECRET");

  const stripeSecretKey = requiredString("STRIPE_SECRET_KEY");
  if (stripeSecretKey.startsWith("sk_live_")) {
    issues.push("STRIPE_SECRET_KEY must not be a live-mode key");
  } else if (
    stripeSecretKey &&
    !/^sk_test_[A-Za-z0-9_]+$/.test(stripeSecretKey)
  ) {
    issues.push("STRIPE_SECRET_KEY must be a Stripe test-mode secret key");
  }

  const stripeWebhookSecret = requiredString("STRIPE_WEBHOOK_SECRET");
  if (
    stripeWebhookSecret &&
    !/^whsec_[A-Za-z0-9_]+$/.test(stripeWebhookSecret)
  ) {
    issues.push(
      "STRIPE_WEBHOOK_SECRET must be a Stripe webhook signing secret",
    );
  }

  if (issues.length > 0) {
    throw new ConfigurationError(issues);
  }

  return Object.freeze({
    nodeEnv,
    port,
    clientUrl: clientUrl.replace(/\/+$/, ""),
    mongoUri,
    redisUrl,
    jwe: Object.freeze({
      accessSecret,
      refreshSecret,
      accessExpiration,
      refreshExpiration,
      accessExpirationSeconds,
      refreshExpirationSeconds,
    }),
    cloudinary: Object.freeze({
      cloudName,
      apiKey: cloudinaryApiKey,
      apiSecret: cloudinaryApiSecret,
    }),
    stripe: Object.freeze({
      secretKey: stripeSecretKey,
      webhookSecret: stripeWebhookSecret,
    }),
  });
};

let cachedConfig;

export const getConfig = () => {
  cachedConfig ??= validateEnvironment(process.env);
  return cachedConfig;
};
