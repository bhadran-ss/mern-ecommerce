import assert from "node:assert/strict";
import test from "node:test";
import {
  FrontendConfigurationError,
  validateFrontendEnvironment,
} from "../src/config/env.js";

const validEnvironment = () => ({
  VITE_API_URL: "http://localhost:5000/api",
  VITE_STRIPE_PUBLISHABLE_KEY: "pk_test_safe_fixture_only",
});

test("valid frontend environment is normalized", () => {
  const config = validateFrontendEnvironment(validEnvironment());

  assert.equal(config.apiUrl, "http://localhost:5000/api");
  assert.match(config.stripePublishableKey, /^pk_test_/);
});

test("missing frontend configuration produces clear field-only errors", () => {
  assert.throws(
    () => validateFrontendEnvironment({}),
    (error) => {
      assert.ok(error instanceof FrontendConfigurationError);
      assert.match(error.message, /VITE_API_URL is required/);
      assert.match(error.message, /VITE_STRIPE_PUBLISHABLE_KEY is required/);
      return true;
    },
  );
});

test("frontend live Stripe keys are rejected without echoing the key", () => {
  const environment = validEnvironment();
  const liveKey = "pk_live_safe_noncredential_fixture";
  environment.VITE_STRIPE_PUBLISHABLE_KEY = liveKey;

  assert.throws(
    () => validateFrontendEnvironment(environment),
    (error) => {
      assert.match(error.message, /must not be a live-mode key/);
      assert.doesNotMatch(error.message, new RegExp(liveKey));
      return true;
    },
  );
});

test("frontend API URL must be HTTP(S) or root-relative", () => {
  const environment = validEnvironment();
  environment.VITE_API_URL = "ftp://example.test/api";

  assert.throws(
    () => validateFrontendEnvironment(environment),
    /VITE_API_URL must use HTTP or HTTPS/,
  );
});
