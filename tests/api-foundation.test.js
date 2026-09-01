import assert from "node:assert/strict";
import { createServer } from "node:http";
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

const [{ createApp }, { createLogger }] = await Promise.all([
  import("../back-end/app.js"),
  import("../back-end/lib/logger.js"),
]);

const config = Object.freeze({
  nodeEnv: "test",
  clientUrl: "http://localhost:5173",
});

const withServer = async (app, run) => {
  const server = createServer(app);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
};

const createTestApp = (options = {}) => {
  const entries = [];
  const logger = createLogger({ sink: (entry) => entries.push(entry) });
  const app = createApp({
    config,
    logger,
    getDependencyStatus: () => ({ mongodb: true, redis: true }),
    registerApiRoutes: () => {},
    ...options,
  });

  return { app, entries };
};

test("health responses include request IDs, security headers, and explicit CORS", async () => {
  const { app } = createTestApp();

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: config.clientUrl },
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(body.requestId, response.headers.get("x-request-id"));
    assert.match(body.requestId, /^[0-9a-f-]{36}$/i);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(
      response.headers.get("access-control-allow-origin"),
      config.clientUrl,
    );
    assert.equal(response.headers.get("x-powered-by"), null);
  });
});

test("readiness returns 503 until both required dependencies are ready", async () => {
  const state = { mongodb: true, redis: false };
  const { app } = createTestApp({ getDependencyStatus: () => state });

  await withServer(app, async (baseUrl) => {
    const unavailable = await fetch(`${baseUrl}/api/ready`);
    assert.equal(unavailable.status, 503);
    assert.deepEqual((await unavailable.json()).dependencies, state);

    state.redis = true;
    const ready = await fetch(`${baseUrl}/api/ready`);
    assert.equal(ready.status, 200);
    assert.equal((await ready.json()).status, "ready");
  });
});

test("API 404 and internal errors use the safe consistent error structure", async () => {
  const secretMarker = "sk_test_should_never_leave_the_server";
  const { app, entries } = createTestApp({
    registerApiRoutes: (router) => {
      router.get("/api/failure", () => {
        throw new Error(`Database failed with ${secretMarker}`);
      });
      router.get("/api/legacy-bad-request", (_req, res) => {
        res.status(400).json({ message: "A field is required" });
      });
      router.get("/api/legacy-failure", (_req, res) => {
        res.status(500).json({ error: new Error(secretMarker) });
      });
    },
  });

  await withServer(app, async (baseUrl) => {
    const missing = await fetch(`${baseUrl}/api/missing`);
    const missingBody = await missing.json();
    assert.equal(missing.status, 404);
    assert.equal(missingBody.error.code, "ROUTE_NOT_FOUND");
    assert.equal(
      missingBody.error.requestId,
      missing.headers.get("x-request-id"),
    );

    const failed = await fetch(`${baseUrl}/api/failure`);
    const responseText = await failed.text();
    assert.equal(failed.status, 500);
    assert.doesNotMatch(responseText, new RegExp(secretMarker));
    assert.equal(
      JSON.parse(responseText).error.message,
      "Internal server error",
    );

    const legacyBadRequest = await fetch(`${baseUrl}/api/legacy-bad-request`);
    const legacyBadRequestBody = await legacyBadRequest.json();
    assert.equal(legacyBadRequest.status, 400);
    assert.equal(legacyBadRequestBody.message, "A field is required");
    assert.equal(legacyBadRequestBody.error.code, "BAD_REQUEST");

    const legacyFailure = await fetch(`${baseUrl}/api/legacy-failure`);
    const legacyFailureText = await legacyFailure.text();
    assert.equal(legacyFailure.status, 500);
    assert.doesNotMatch(legacyFailureText, new RegExp(secretMarker));
    assert.equal(
      JSON.parse(legacyFailureText).error.message,
      "Internal server error",
    );
  });

  const serializedLogs = JSON.stringify(entries);
  assert.doesNotMatch(serializedLogs, new RegExp(secretMarker));
  assert.match(serializedLogs, /\[REDACTED\]/);
});

test("structured logging redacts secret fields, keys, and credential URLs", () => {
  const entries = [];
  const logger = createLogger({ sink: (entry) => entries.push(entry) });
  const markers = {
    password: "password-marker",
    token: "token-marker",
    stripe: "sk_test_logging_marker",
    uri: "redis://user:redis-password-marker@example.test:6379",
  };

  logger.error("redaction.test", {
    password: markers.password,
    accessToken: markers.token,
    error: new Error(`${markers.stripe} ${markers.uri}`),
  });

  const serialized = JSON.stringify(entries);
  for (const marker of Object.values(markers)) {
    assert.doesNotMatch(
      serialized,
      new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
  assert.match(serialized, /\[REDACTED\]/);
});

test("disallowed origins, oversized bodies, and excessive requests are rejected", async () => {
  const { app: corsApp } = createTestApp();
  await withServer(corsApp, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: "https://untrusted.example" },
    });
    assert.equal(response.status, 403);
    assert.equal((await response.json()).error.code, "CORS_ORIGIN_DENIED");
  });

  const { app: bodyApp } = createTestApp({
    csrfProtection: (_req, _res, next) => next(),
    registerApiRoutes: (router) => {
      router.post("/api/echo", (req, res) => res.json(req.body));
    },
  });
  await withServer(bodyApp, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/echo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: "x".repeat(101 * 1_024) }),
    });
    assert.equal(response.status, 413);
    assert.equal((await response.json()).error.code, "PAYLOAD_TOO_LARGE");
  });

  const { app: limitedApp } = createTestApp({
    rateLimitOptions: { windowMs: 60_000, limit: 1 },
  });
  await withServer(limitedApp, async (baseUrl) => {
    assert.equal((await fetch(`${baseUrl}/api/health`)).status, 200);
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 429);
    assert.equal((await response.json()).error.code, "RATE_LIMIT_EXCEEDED");
  });
});
