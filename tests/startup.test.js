import assert from "node:assert/strict";
import test from "node:test";

import { initializeDependencies } from "../back-end/bootstrap.js";

const config = {
  cloudinary: {},
  stripeSecretKey: "sk_test_safe_fixture",
  mongoUri: "mongodb://fixture",
  redisUrl: "redis://fixture",
};
const logger = { info: () => {} };

test("startup waits for MongoDB and Redis before completing", async () => {
  const events = [];
  await initializeDependencies({
    config,
    logger,
    configureCloudinary: () => events.push("cloudinary"),
    initializeStripe: () => events.push("stripe"),
    connectDatabase: async () => events.push("database"),
    connectRedis: async () => events.push("redis"),
  });
  events.push("ready-to-listen");

  assert.deepEqual(events, [
    "cloudinary",
    "stripe",
    "database",
    "redis",
    "ready-to-listen",
  ]);
});

test("startup stops before Redis and HTTP initialization when MongoDB fails", async () => {
  let redisCalled = false;
  await assert.rejects(
    initializeDependencies({
      config,
      logger,
      configureCloudinary: () => {},
      initializeStripe: () => {},
      connectDatabase: async () => {
        throw new Error("database unavailable");
      },
      connectRedis: async () => {
        redisCalled = true;
      },
    }),
    /database unavailable/,
  );

  assert.equal(redisCalled, false);
});
