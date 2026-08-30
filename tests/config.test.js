import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  ConfigurationError,
  validateEnvironment,
} from "../back-end/config/env.js";

const validEnvironment = () => ({
  NODE_ENV: "test",
  PORT: "5001",
  CLIENT_URL: "http://localhost:5173",
  MONGO_URI: "mongodb://127.0.0.1:27017/mern_ecommerce_test",
  UPSTASH_REDIS_URL: "redis://127.0.0.1:6379",
  JWE_SECRET: "test-access-secret-with-at-least-32-characters",
  JWE_REFRESH_SECRET: "different-test-refresh-secret-with-32-characters",
  JWE_ACCESS_EXPIRATION: "15m",
  JWE_REFRESH_EXPIRATION: "7d",
  CLOUDINARY_CLOUD_NAME: "test-cloud",
  CLOUDINARY_API_KEY: "test-api-key",
  CLOUDINARY_API_SECRET: "test-api-secret",
  STRIPE_SECRET_KEY: "sk_test_safe_fixture_only",
  STRIPE_WEBHOOK_SECRET: "whsec_safe_fixture_only",
});

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

test("valid backend environment is normalized without mutating its source", () => {
  const environment = validEnvironment();
  const snapshot = { ...environment };
  const config = validateEnvironment(environment);

  assert.equal(config.nodeEnv, "test");
  assert.equal(config.port, 5001);
  assert.equal(config.clientUrl, "http://localhost:5173");
  assert.equal(config.jwe.accessExpirationSeconds, 15 * 60);
  assert.equal(config.jwe.refreshExpirationSeconds, 7 * 24 * 60 * 60);
  assert.deepEqual(environment, snapshot);
});

test("missing backend configuration produces a clear field-only error", () => {
  assert.throws(
    () => validateEnvironment({}),
    (error) => {
      assert.ok(error instanceof ConfigurationError);
      assert.match(error.message, /MONGO_URI is required/);
      assert.match(error.message, /STRIPE_WEBHOOK_SECRET is required/);
      return true;
    },
  );
});

test("invalid ports, URLs, durations, and secret lengths are rejected safely", () => {
  const environment = validEnvironment();
  const privateMarker = "private-value-marker";
  environment.PORT = "70000";
  environment.CLIENT_URL = "not-a-url";
  environment.MONGO_URI = "https://example.com/database";
  environment.UPSTASH_REDIS_URL = "https://example.com/redis";
  environment.JWE_SECRET = privateMarker;
  environment.JWE_ACCESS_EXPIRATION = "15 minutes";

  assert.throws(
    () => validateEnvironment(environment),
    (error) => {
      assert.match(error.message, /PORT/);
      assert.match(error.message, /CLIENT_URL/);
      assert.match(error.message, /MONGO_URI/);
      assert.match(error.message, /UPSTASH_REDIS_URL/);
      assert.match(error.message, /JWE_SECRET/);
      assert.match(error.message, /JWE_ACCESS_EXPIRATION/);
      assert.doesNotMatch(error.message, new RegExp(privateMarker));
      return true;
    },
  );
});

test("backend live Stripe keys are rejected without echoing the key", () => {
  const environment = validEnvironment();
  const liveKey = "sk_live_safe_noncredential_fixture";
  environment.STRIPE_SECRET_KEY = liveKey;

  assert.throws(
    () => validateEnvironment(environment),
    (error) => {
      assert.match(error.message, /must not be a live-mode key/);
      assert.doesNotMatch(error.message, new RegExp(liveKey));
      return true;
    },
  );
});

test("access tokens cannot be configured with a long lifetime", () => {
  const environment = validEnvironment();
  environment.JWE_ACCESS_EXPIRATION = "1h";

  assert.throws(
    () => validateEnvironment(environment),
    /JWE_ACCESS_EXPIRATION must not exceed 30 minutes/,
  );
});

test("server startup stops with a clear error when configuration is invalid", () => {
  const environment = {
    ...process.env,
    ...validEnvironment(),
    PORT: "0",
  };
  const result = spawnSync(process.execPath, ["back-end/server.js"], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: environment,
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /PORT must be an integer between 1 and 65535/);
  assert.doesNotMatch(result.stderr, /test-access-secret-with-at-least-32-characters/);
});
