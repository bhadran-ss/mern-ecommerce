const REQUIRED_VARIABLES = [
  "MONGO_URI",
  "UPSTASH_REDIS_URL",
  "JWE_SECRET",
  "JWE_REFRESH_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "STRIPE_SECRET_KEY",
  "CLIENT_URL",
];

const DURATION_PATTERN = /^[1-9][0-9]*[smhd]$/;
const VALID_NODE_ENVIRONMENTS = new Set(["development", "test", "production"]);

export class EnvironmentValidationError extends Error {
  constructor(issues) {
    super(`Invalid environment configuration:\n- ${issues.join("\n- ")}`);
    this.name = "EnvironmentValidationError";
    this.issues = issues;
  }
}

const readString = (environment, name) => environment[name]?.trim() || "";

const validateUrl = (value, name, protocols, issues) => {
  try {
    const parsed = new URL(value);
    if (!protocols.includes(parsed.protocol)) {
      issues.push(`${name} must use ${protocols.join(" or ")}.`);
    }
  } catch {
    issues.push(`${name} must be a valid URL.`);
  }
};

const validateStripeKey = (key, name, expectedPrefix, issues) => {
  if (key.startsWith("sk_live_") || key.startsWith("pk_live_")) {
    issues.push(`${name} is a live Stripe key. Only Stripe test-mode keys are allowed.`);
    return;
  }

  if (!key.startsWith(expectedPrefix)) {
    issues.push(`${name} must be a Stripe test-mode key beginning with ${expectedPrefix}.`);
  }
};

export const validateEnvironment = (environment = process.env) => {
  const issues = [];

  for (const name of REQUIRED_VARIABLES) {
    if (!readString(environment, name)) {
      issues.push(`${name} is required.`);
    }
  }

  const nodeEnv = readString(environment, "NODE_ENV") || "development";
  if (!VALID_NODE_ENVIRONMENTS.has(nodeEnv)) {
    issues.push("NODE_ENV must be development, test, or production.");
  }

  const portSource = readString(environment, "PORT") || "5000";
  const port = Number(portSource);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    issues.push("PORT must be an integer between 1 and 65535.");
  }

  const mongoUri = readString(environment, "MONGO_URI");
  if (mongoUri) {
    validateUrl(mongoUri, "MONGO_URI", ["mongodb:", "mongodb+srv:"], issues);
  }

  const redisUrl = readString(environment, "UPSTASH_REDIS_URL");
  if (redisUrl) {
    validateUrl(redisUrl, "UPSTASH_REDIS_URL", ["redis:", "rediss:"], issues);
  }

  const clientUrl = readString(environment, "CLIENT_URL");
  if (clientUrl) {
    validateUrl(clientUrl, "CLIENT_URL", ["http:", "https:"], issues);
  }

  for (const name of ["JWE_SECRET", "JWE_REFRESH_SECRET"]) {
    const secret = readString(environment, name);
    if (secret && secret.length < 32) {
      issues.push(`${name} must contain at least 32 characters.`);
    }
  }

  const accessExpiration =
    readString(environment, "JWE_ACCESS_EXPIRATION") || "15m";
  const refreshExpiration =
    readString(environment, "JWE_REFRESH_EXPIRATION") || "7d";
  if (!DURATION_PATTERN.test(accessExpiration)) {
    issues.push("JWE_ACCESS_EXPIRATION must use a positive duration such as 15m.");
  }
  if (!DURATION_PATTERN.test(refreshExpiration)) {
    issues.push("JWE_REFRESH_EXPIRATION must use a positive duration such as 7d.");
  }

  const stripeSecretKey = readString(environment, "STRIPE_SECRET_KEY");
  if (stripeSecretKey) {
    validateStripeKey(stripeSecretKey, "STRIPE_SECRET_KEY", "sk_test_", issues);
  }

  const stripePublishableKey = readString(
    environment,
    "STRIPE_PUBLISHABLE_KEY",
  );
  if (stripePublishableKey) {
    validateStripeKey(
      stripePublishableKey,
      "STRIPE_PUBLISHABLE_KEY",
      "pk_test_",
      issues,
    );
  }

  if (issues.length > 0) {
    throw new EnvironmentValidationError(issues);
  }

  return Object.freeze({
    nodeEnv,
    port,
    mongoUri,
    redisUrl,
    clientUrl: clientUrl.replace(/\/$/, ""),
    jweSecret: readString(environment, "JWE_SECRET"),
    jweRefreshSecret: readString(environment, "JWE_REFRESH_SECRET"),
    jweAccessExpiration: accessExpiration,
    jweRefreshExpiration: refreshExpiration,
    cloudinary: Object.freeze({
      cloudName: readString(environment, "CLOUDINARY_CLOUD_NAME"),
      apiKey: readString(environment, "CLOUDINARY_API_KEY"),
      apiSecret: readString(environment, "CLOUDINARY_API_SECRET"),
    }),
    stripeSecretKey,
  });
};

let runtimeConfig;

export const initializeEnvironment = (environment = process.env) => {
  runtimeConfig = validateEnvironment(environment);
  return runtimeConfig;
};

export const getEnvironment = () => {
  if (!runtimeConfig) {
    throw new Error("Application environment has not been initialized.");
  }
  return runtimeConfig;
};
