import assert from "node:assert/strict";
import test from "node:test";

import {
  EnvironmentValidationError,
  validateEnvironment,
} from "../back-end/config/env.js";

const validEnvironment = () => ({
  NODE_ENV: "test",
  PORT: "5000",
  CLIENT_URL: "http://localhost:5173",
  MONGO_URI: "mongodb://127.0.0.1:27017/mern_ecommerce_test",
  UPSTASH_REDIS_URL: "redis://127.0.0.1:6379",
  JWE_SECRET: "a".repeat(32),
  JWE_REFRESH_SECRET: "b".repeat(32),
  JWE_ACCESS_EXPIRATION: "15m",
  JWE_REFRESH_EXPIRATION: "7d",
  CLOUDINARY_CLOUD_NAME: "demo-cloud",
  CLOUDINARY_API_KEY: "demo-api-key",
  CLOUDINARY_API_SECRET: "demo-api-secret",
  STRIPE_SECRET_KEY: "sk_test_safe_fixture",
  STRIPE_PUBLISHABLE_KEY: "pk_test_safe_fixture",
});

test("valid environment values are parsed without exposing secrets", () => {
  const config = validateEnvironment(validEnvironment());

  assert.equal(config.nodeEnv, "test");
  assert.equal(config.port, 5000);
  assert.equal(config.clientUrl, "http://localhost:5173");
  assert.equal(config.stripeSecretKey, "sk_test_safe_fixture");
});

test("missing required environment variables produce actionable errors", () => {
  assert.throws(
    () => validateEnvironment({}),
    (error) => {
      assert.ok(error instanceof EnvironmentValidationError);
      assert.match(error.message, /MONGO_URI is required/);
      assert.match(error.message, /STRIPE_SECRET_KEY is required/);
      return true;
    },
  );
});

test("live Stripe secret and publishable keys are rejected", () => {
  const secretEnvironment = validEnvironment();
  secretEnvironment.STRIPE_SECRET_KEY = "sk_live_forbidden_fixture";
  assert.throws(
    () => validateEnvironment(secretEnvironment),
    /Only Stripe test-mode keys are allowed/,
  );

  const publishableEnvironment = validEnvironment();
  publishableEnvironment.STRIPE_PUBLISHABLE_KEY = "pk_live_forbidden_fixture";
  assert.throws(
    () => validateEnvironment(publishableEnvironment),
    /Only Stripe test-mode keys are allowed/,
  );
});

test("invalid URLs, ports, secrets, and durations are rejected together", () => {
  const environment = validEnvironment();
  environment.MONGO_URI = "https://example.com";
  environment.PORT = "70000";
  environment.JWE_SECRET = "short";
  environment.JWE_ACCESS_EXPIRATION = "fifteen-minutes";

  assert.throws(
    () => validateEnvironment(environment),
    (error) => {
      assert.equal(error.issues.length, 4);
      assert.match(
        error.message,
        /MONGO_URI must use mongodb: or mongodb\+srv:/,
      );
      assert.match(error.message, /PORT must be an integer/);
      return true;
    },
  );
});
