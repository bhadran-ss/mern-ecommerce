import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(configDirectory, "../..");

if (process.env.NODE_ENV !== "test") {
  dotenv.config({ path: path.join(projectRoot, ".env"), quiet: true });
}

const testDefaults = {
  PORT: "5000",
  CLIENT_URL: "http://localhost:5173",
  MONGO_URI: "mongodb://127.0.0.1:27017/mern_ecommerce_test",
  UPSTASH_REDIS_URL: "redis://127.0.0.1:6379/15",
  JWE_SECRET: "test-only-access-secret-not-for-any-other-environment",
  JWE_REFRESH_SECRET: "test-only-refresh-secret-not-for-any-other-environment",
  JWE_ACCESS_EXPIRATION: "15m",
  JWE_REFRESH_EXPIRATION: "7d",
  CLOUDINARY_CLOUD_NAME: "test-cloud",
  CLOUDINARY_API_KEY: "test-api-key",
  CLOUDINARY_API_SECRET: "test-api-secret",
  STRIPE_SECRET_KEY: "sk_test_test_only",
  STRIPE_WEBHOOK_SECRET: "whsec_test_only",
};

const durationToSeconds = (value, name, errors) => {
  const match = /^([1-9][0-9]*)(s|m|h|d)$/.exec(value);
  if (!match) {
    errors.push(`${name} must be a positive duration such as 15m or 7d.`);
    return 0;
  }

  const amount = Number(match[1]);
  const unitSeconds = { s: 1, m: 60, h: 3600, d: 86400 }[match[2]];
  const seconds = amount * unitSeconds;
  if (!Number.isSafeInteger(seconds) || seconds > 365 * 86400) {
    errors.push(`${name} must be no longer than 365 days.`);
    return 0;
  }

  return seconds;
};

const parseUrl = (value, name, allowedProtocols, errors, allowCredentials = false) => {
  try {
    const parsed = new URL(value);
    if (
      !allowedProtocols.includes(parsed.protocol) ||
      (!allowCredentials && (parsed.username || parsed.password))
    ) {
      throw new Error("invalid protocol or credentials");
    }
    return parsed;
  } catch {
    errors.push(`${name} must be a valid URL using ${allowedProtocols.join(" or ")}.`);
    return null;
  }
};

export const createConfig = (source = process.env) => {
  const errors = [];
  const isTest = source.NODE_ENV === "test";
  const read = (name, fallback) => {
    const value = source[name] ?? (isTest ? testDefaults[name] : fallback);
    if (typeof value !== "string" || value.trim() === "") {
      errors.push(`${name} is required.`);
      return "";
    }
    return value.trim();
  };

  const nodeEnv = read("NODE_ENV", "development");
  if (!["development", "test", "production"].includes(nodeEnv)) {
    errors.push("NODE_ENV must be development, test, or production.");
  }

  const portValue = read("PORT", "5000");
  const port = Number(portValue);
  if (!/^\d+$/.test(portValue) || !Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push("PORT must be an integer between 1 and 65535.");
  }

  const clientUrlValue = read("CLIENT_URL");
  const clientUrl = parseUrl(clientUrlValue, "CLIENT_URL", ["http:", "https:"], errors);

  const mongoUri = read("MONGO_URI");
  const mongoUrl = parseUrl(
    mongoUri,
    "MONGO_URI",
    ["mongodb:", "mongodb+srv:"],
    errors,
    true,
  );

  const redisUrl = read("UPSTASH_REDIS_URL");
  const redisParsedUrl = parseUrl(
    redisUrl,
    "UPSTASH_REDIS_URL",
    ["redis:", "rediss:"],
    errors,
    true,
  );
  if (isTest) {
    const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
    if (mongoUrl && !localHosts.has(mongoUrl.hostname)) {
      errors.push("MONGO_URI must use a local host when NODE_ENV=test.");
    }
    if (redisParsedUrl && !localHosts.has(redisParsedUrl.hostname)) {
      errors.push("UPSTASH_REDIS_URL must use a local host when NODE_ENV=test.");
    }
  }

  const accessSecret = read("JWE_SECRET");
  const refreshSecret = read("JWE_REFRESH_SECRET");
  for (const [name, value] of [["JWE_SECRET", accessSecret], ["JWE_REFRESH_SECRET", refreshSecret]]) {
    if (Buffer.byteLength(value, "utf8") < 32) {
      errors.push(`${name} must be at least 32 bytes long.`);
    }
    if (/^(replace|your|change|example)[-_]/i.test(value)) {
      errors.push(`${name} must be replaced with a generated secret.`);
    }
  }
  if (accessSecret && refreshSecret && accessSecret === refreshSecret) {
    errors.push("JWE_SECRET and JWE_REFRESH_SECRET must be different values.");
  }

  const accessExpiration = read("JWE_ACCESS_EXPIRATION", "15m");
  const refreshExpiration = read("JWE_REFRESH_EXPIRATION", "7d");
  const accessTokenSeconds = durationToSeconds(accessExpiration, "JWE_ACCESS_EXPIRATION", errors);
  const refreshTokenSeconds = durationToSeconds(refreshExpiration, "JWE_REFRESH_EXPIRATION", errors);

  const cloudinaryCloudName = read("CLOUDINARY_CLOUD_NAME");
  const cloudinaryApiKey = read("CLOUDINARY_API_KEY");
  const cloudinaryApiSecret = read("CLOUDINARY_API_SECRET");

  const stripeSecretKey = read("STRIPE_SECRET_KEY");
  if (stripeSecretKey.startsWith("sk_live_")) {
    errors.push("STRIPE_SECRET_KEY must use Stripe test mode; live keys are not supported.");
  } else if (!stripeSecretKey.startsWith("sk_test_")) {
    errors.push("STRIPE_SECRET_KEY must start with sk_test_.");
  }

  const stripeWebhookSecret = read("STRIPE_WEBHOOK_SECRET");
  if (!stripeWebhookSecret.startsWith("whsec_")) {
    errors.push("STRIPE_WEBHOOK_SECRET must start with whsec_.");
  }

  if (errors.length) {
    throw new Error(`Invalid environment configuration:\n- ${errors.join("\n- ")}`);
  }

  return Object.freeze({
    NODE_ENV: nodeEnv,
    PORT: port,
    CLIENT_URL: clientUrl.origin + clientUrl.pathname.replace(/\/+$/, ""),
    MONGO_URI: mongoUri,
    UPSTASH_REDIS_URL: redisUrl,
    JWE_SECRET: accessSecret,
    JWE_REFRESH_SECRET: refreshSecret,
    JWE_ACCESS_EXPIRATION: accessExpiration,
    JWE_REFRESH_EXPIRATION: refreshExpiration,
    ACCESS_TOKEN_MAX_AGE_MS: accessTokenSeconds * 1000,
    REFRESH_TOKEN_MAX_AGE_MS: refreshTokenSeconds * 1000,
    CLOUDINARY_CLOUD_NAME: cloudinaryCloudName,
    CLOUDINARY_API_KEY: cloudinaryApiKey,
    CLOUDINARY_API_SECRET: cloudinaryApiSecret,
    STRIPE_SECRET_KEY: stripeSecretKey,
    STRIPE_WEBHOOK_SECRET: stripeWebhookSecret,
  });
};

const config = createConfig();
export default config;
