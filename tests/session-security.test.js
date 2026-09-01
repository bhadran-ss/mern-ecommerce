import assert from "node:assert/strict";
import test from "node:test";

Object.assign(process.env, {
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

const [
  { createAuthController },
  { createCsrfProtection },
  { createCsrfTokenService },
  { requireAdministrator, requireCustomer, requireSeller },
  tokenService,
] = await Promise.all([
  import("../back-end/controllers/auth.controller.js"),
  import("../back-end/middleware/csrf.middleware.js"),
  import("../back-end/utils/csrf.service.js"),
  import("../back-end/middleware/authorize.js"),
  import("../back-end/utils/token.service.js"),
]);

const createResponse = () => ({
  statusCode: 200,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
  set() {
    return this;
  },
});

const invoke = async (handler, request) => {
  const response = createResponse();
  let nextError;
  await handler(request, response, (error) => {
    nextError = error;
  });
  return { response, nextError };
};

const activeUser = {
  _id: "user-123",
  name: "Current User",
  email: "current@example.com",
  role: "seller",
  accountStatus: "active",
};

const createRefreshFixture = ({ rotationResult = "rotated" } = {}) => {
  const calls = { cleared: 0 };
  const controller = createAuthController({
    users: {
      findById: async (id) => {
        calls.loadedUserId = id;
        return activeUser;
      },
    },
    sessions: {
      rotate: async (value) => {
        calls.rotation = value;
        return rotationResult;
      },
      revoke: async (value) => {
        calls.revoked = value;
      },
      revokeAll: async (id) => {
        calls.revokedAll = id;
      },
    },
    tokens: {
      decryptRefreshToken: async () => ({
        sub: "user-123",
        sid: "device-session",
        fid: "device-family",
      }),
      createRefreshToken: async (user, identifiers) => {
        calls.refreshUser = user;
        calls.refreshIdentifiers = identifiers;
        return "next-refresh-token";
      },
      createAccessToken: async (user, identifiers) => {
        calls.accessUser = user;
        calls.accessIdentifiers = identifiers;
        return "next-access-token";
      },
    },
    cookies: {
      setSessionCookies: (_res, accessToken, refreshToken) => {
        calls.cookies = { accessToken, refreshToken };
      },
      clearSessionCookies: () => {
        calls.cleared += 1;
      },
    },
    refreshExpirationSeconds: 600,
  });

  return { calls, controller };
};

test("refresh rotates the device token and reloads the current user role", async () => {
  const { calls, controller } = createRefreshFixture();
  const { response, nextError } = await invoke(controller.refreshAccessToken, {
    cookies: { refreshToken: "current-refresh-token" },
  });

  assert.equal(nextError, undefined);
  assert.equal(response.statusCode, 200);
  assert.equal(calls.loadedUserId, "user-123");
  assert.equal(calls.accessUser.role, "seller");
  assert.deepEqual(calls.accessIdentifiers, { sessionId: "device-session" });
  assert.deepEqual(calls.rotation, {
    userId: "user-123",
    sessionId: "device-session",
    familyId: "device-family",
    currentRefreshToken: "current-refresh-token",
    nextRefreshToken: "next-refresh-token",
    expiresInSeconds: 600,
  });
  assert.deepEqual(calls.cookies, {
    accessToken: "next-access-token",
    refreshToken: "next-refresh-token",
  });
  assert.equal(response.body.user.role, "seller");
});

test("reuse of a rotated token rejects and clears the compromised family cookies", async () => {
  const { calls, controller } = createRefreshFixture({
    rotationResult: "reused",
  });
  const { nextError } = await invoke(controller.refreshAccessToken, {
    cookies: { refreshToken: "rotated-token" },
  });

  assert.equal(nextError.status, 401);
  assert.equal(nextError.code, "REFRESH_TOKEN_REUSED");
  assert.equal(calls.cleared, 1);
  assert.equal(calls.cookies, undefined);
});

test("current-device logout is idempotent and always clears cookies", async () => {
  const { calls, controller } = createRefreshFixture();
  const valid = await invoke(controller.logout, {
    cookies: { refreshToken: "current-refresh-token" },
  });

  assert.equal(valid.response.statusCode, 200);
  assert.deepEqual(calls.revoked, {
    userId: "user-123",
    sessionId: "device-session",
    familyId: "device-family",
  });
  assert.equal(calls.cleared, 1);

  const invalidCalls = { cleared: 0 };
  const invalidController = createAuthController({
    sessions: {},
    tokens: {
      decryptRefreshToken: async () => {
        const error = new Error("expired");
        error.name = "TokenExpiredError";
        throw error;
      },
    },
    cookies: {
      clearSessionCookies: () => {
        invalidCalls.cleared += 1;
      },
    },
  });
  const invalid = await invoke(invalidController.logout, {
    cookies: { refreshToken: "expired-token" },
  });

  assert.equal(invalid.response.statusCode, 200);
  assert.equal(invalid.nextError, undefined);
  assert.equal(invalidCalls.cleared, 1);
});

test("all-device logout revokes every session owned by the authenticated user", async () => {
  const { calls, controller } = createRefreshFixture();
  const { response, nextError } = await invoke(controller.logoutAll, {
    user: { _id: "user-123" },
  });

  assert.equal(nextError, undefined);
  assert.equal(response.statusCode, 200);
  assert.equal(calls.revokedAll, "user-123");
  assert.equal(calls.cleared, 1);
});

test("separate sign-ins receive independent device and family identifiers", async () => {
  const first = tokenService.createSessionIdentifiers();
  const second = tokenService.createSessionIdentifiers();

  assert.notEqual(first.sessionId, second.sessionId);
  assert.notEqual(first.familyId, second.familyId);

  const firstToken = await tokenService.createRefreshToken(activeUser, first);
  const rotatedToken = await tokenService.createRefreshToken(activeUser, first);
  const decoded = await tokenService.decryptRefreshToken(firstToken);

  assert.notEqual(firstToken, rotatedToken);
  assert.equal(decoded.sid, first.sessionId);
  assert.equal(decoded.fid, first.familyId);
  assert.equal("role" in decoded, false);
});

test("signed double-submit CSRF protection rejects missing and mismatched tokens", async () => {
  const tokens = createCsrfTokenService({ secret: "csrf-test-secret" });
  const protection = createCsrfProtection({ tokens });
  const validToken = tokens.createToken();

  const missing = await invoke(protection, {
    method: "POST",
    cookies: {},
    get: () => undefined,
  });
  assert.equal(missing.nextError.code, "CSRF_TOKEN_INVALID");

  const mismatched = await invoke(protection, {
    method: "POST",
    cookies: { csrfToken: validToken },
    get: () => `${validToken}changed`,
  });
  assert.equal(mismatched.nextError.code, "CSRF_TOKEN_INVALID");

  const accepted = await invoke(protection, {
    method: "POST",
    cookies: { csrfToken: validToken },
    get: () => validToken,
  });
  assert.equal(accepted.nextError, undefined);

  const safe = await invoke(protection, {
    method: "GET",
    cookies: {},
    get: () => undefined,
  });
  assert.equal(safe.nextError, undefined);
});

const authorizationResult = async (middleware, role) =>
  invoke(middleware, { user: role ? { role } : undefined });

test("customer, seller, and administrator middleware enforce explicit roles", async () => {
  assert.equal(
    (await authorizationResult(requireCustomer, "customer")).nextError,
    undefined,
  );
  assert.equal(
    (await authorizationResult(requireSeller, "seller")).nextError,
    undefined,
  );
  assert.equal(
    (await authorizationResult(requireSeller, "admin")).nextError,
    undefined,
  );
  assert.equal(
    (await authorizationResult(requireAdministrator, "admin")).nextError,
    undefined,
  );
  assert.equal(
    (await authorizationResult(requireAdministrator, "seller")).nextError.code,
    "FORBIDDEN",
  );
  assert.equal(
    (await authorizationResult(requireCustomer, undefined)).nextError.code,
    "UNAUTHORIZED",
  );
});
