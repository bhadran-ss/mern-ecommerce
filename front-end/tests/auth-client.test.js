import assert from "node:assert/strict";
import { setImmediate as waitForImmediate } from "node:timers/promises";
import test from "node:test";
import axios from "axios";

import { createApiClient } from "../src/lib/api-client.js";

const response = (config, data = {}) => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config,
});

const unauthorized = (config) =>
  new axios.AxiosError(
    "Unauthorized",
    axios.AxiosError.ERR_BAD_REQUEST,
    config,
    undefined,
    { ...response(config), status: 401, statusText: "Unauthorized" },
  );

test("simultaneous 401 responses share one refresh and each retry once", async () => {
  let refreshCalls = 0;
  let releaseRefresh;
  let refreshed = false;
  const refreshGate = new Promise((resolve) => {
    releaseRefresh = resolve;
  });
  const attempts = new Map();

  const adapter = async (config) => {
    if (config.url === "/auth/csrf-token") {
      return response(config, { csrfToken: "signed-csrf-token" });
    }
    if (config.url === "/auth/refresh-token") {
      refreshCalls += 1;
      await refreshGate;
      refreshed = true;
      return response(config);
    }

    const count = (attempts.get(config.url) ?? 0) + 1;
    attempts.set(config.url, count);
    if (!refreshed) {
      throw unauthorized(config);
    }
    return response(config, { path: config.url });
  };

  const client = createApiClient({ baseURL: "/api", adapter });
  const requests = Promise.all([client.get("/cart"), client.get("/auth/profile")]);
  await waitForImmediate();

  assert.equal(refreshCalls, 1);
  releaseRefresh();
  const results = await requests;

  assert.deepEqual(results.map(({ data }) => data.path), [
    "/cart",
    "/auth/profile",
  ]);
  assert.equal(attempts.get("/cart"), 2);
  assert.equal(attempts.get("/auth/profile"), 2);
});

test("refresh failure clears authentication once and does not loop", async () => {
  let refreshCalls = 0;
  let failureCalls = 0;
  const adapter = async (config) => {
    if (config.url === "/auth/csrf-token") {
      return response(config, { csrfToken: "signed-csrf-token" });
    }
    if (config.url === "/auth/refresh-token") {
      refreshCalls += 1;
      throw unauthorized(config);
    }
    throw unauthorized(config);
  };

  const client = createApiClient({ baseURL: "/api", adapter });
  client.setAuthenticationFailureHandler(() => {
    failureCalls += 1;
  });

  const results = await Promise.allSettled([
    client.get("/cart"),
    client.get("/auth/profile"),
  ]);

  assert.equal(results.every(({ status }) => status === "rejected"), true);
  assert.equal(refreshCalls, 1);
  assert.equal(failureCalls, 1);
});

test("unsafe requests receive the CSRF header and login failures do not refresh", async () => {
  let refreshCalls = 0;
  let mutationHeader;
  const adapter = async (config) => {
    if (config.url === "/auth/csrf-token") {
      return response(config, { csrfToken: "signed-csrf-token" });
    }
    if (config.url === "/cart") {
      mutationHeader = config.headers.get("X-CSRF-Token");
      return response(config);
    }
    if (config.url === "/auth/refresh-token") {
      refreshCalls += 1;
      return response(config);
    }
    throw unauthorized(config);
  };

  const client = createApiClient({ baseURL: "/api", adapter });
  await client.post("/cart", { productId: "product-1" });
  await assert.rejects(client.post("/auth/login", {}));

  assert.equal(mutationHeader, "signed-csrf-token");
  assert.equal(refreshCalls, 0);
});
