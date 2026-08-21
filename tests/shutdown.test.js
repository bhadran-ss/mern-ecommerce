import assert from "node:assert/strict";
import test from "node:test";

import { createShutdown } from "../back-end/utils/shutdown.js";

test("graceful shutdown closes HTTP, MongoDB, and Redis exactly once", async () => {
  const calls = [];
  const server = {
    close: (callback) => {
      calls.push("http");
      callback();
    },
  };
  const logger = { info: () => {}, error: () => {} };
  const shutdown = createShutdown({
    server,
    logger,
    disconnectDatabase: async () => calls.push("database"),
    disconnectRedis: async () => calls.push("redis"),
    timeoutMs: 100,
  });

  await Promise.all([shutdown("SIGTERM"), shutdown("SIGTERM")]);

  assert.deepEqual(calls.sort(), ["database", "http", "redis"]);
});
