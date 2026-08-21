import assert from "node:assert/strict";
import test from "node:test";

import { validateStripePublishableKey } from "../front-end/stripe-key-validation.js";

test("frontend accepts only Stripe test publishable keys", () => {
  assert.equal(
    validateStripePublishableKey("pk_test_safe_fixture"),
    "pk_test_safe_fixture",
  );
  assert.throws(
    () => validateStripePublishableKey("pk_live_forbidden_fixture"),
    /Live Stripe keys are not allowed/,
  );
  assert.throws(
    () => validateStripePublishableKey("sk_test_wrong_key_type"),
    /Stripe test publishable key is required/,
  );
});
