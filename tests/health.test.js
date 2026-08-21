import assert from "node:assert/strict";
import test from "node:test";

import { createApp } from "../back-end/app.js";

const silentLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
};

const requestApp = async (getReadiness, path) => {
  const app = createApp({
    config: { clientUrl: "http://localhost:5173" },
    logger: silentLogger,
    getReadiness,
  });
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));

  try {
    const address = server.address();
    return await fetch(`http://127.0.0.1:${address.port}${path}`);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
};

test("health endpoint reports a live process", async () => {
  const response = await requestApp(
    () => ({ ready: false, services: {} }),
    "/api/health",
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.status, "ok");
  assert.equal(typeof body.data.uptimeSeconds, "number");
});

test("readiness endpoint reports ready dependencies", async () => {
  const services = {
    database: { ready: true, status: "connected" },
    redis: { ready: true, status: "ready" },
  };
  const response = await requestApp(
    () => ({ ready: true, services }),
    "/api/ready",
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.status, "ready");
  assert.deepEqual(body.data.services, services);
});

test("readiness endpoint returns a consistent 503 error when degraded", async () => {
  const response = await requestApp(
    () => ({
      ready: false,
      services: {
        database: { ready: false, status: "disconnected" },
        redis: { ready: true, status: "ready" },
      },
    }),
    "/api/ready",
  );
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "SERVICE_NOT_READY");
  assert.equal(typeof body.requestId, "string");
});

test("unknown API routes use the centralized error envelope", async () => {
  const response = await requestApp(
    () => ({ ready: true, services: {} }),
    "/api/not-a-route",
  );
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.deepEqual(Object.keys(body).sort(), ["error", "requestId", "success"]);
  assert.equal(body.error.code, "ROUTE_NOT_FOUND");
});

test("authentication middleware uses the centralized error envelope", async () => {
  const response = await requestApp(
    () => ({ ready: true, services: {} }),
    "/api/auth/profile",
  );
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "AUTHENTICATION_REQUIRED");
  assert.equal(typeof body.requestId, "string");
});
