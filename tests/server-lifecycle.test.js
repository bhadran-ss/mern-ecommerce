import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { createServer } from "node:http";
import test from "node:test";

import { createLogger } from "../back-end/lib/logger.js";
import { createServerLifecycle } from "../back-end/server.js";

const config = Object.freeze({
  nodeEnv: "test",
  port: 0,
  mongoUri: "mongodb://unused.test/database",
  redisUrl: "redis://unused.test:6379",
});

const silentLogger = () => createLogger({ sink: () => {} });

test("server waits for MongoDB and Redis before listening and closes all resources", async () => {
  const events = [];
  let databaseReady = false;
  let redisReady = false;
  const processRef = new EventEmitter();
  processRef.exitCode = 0;

  const database = {
    connect: async () => {
      events.push("mongodb.connect");
      databaseReady = true;
    },
    disconnect: async () => {
      events.push("mongodb.disconnect");
      databaseReady = false;
    },
    isReady: () => databaseReady,
  };
  const cache = {
    connect: async () => {
      events.push("redis.connect");
      redisReady = true;
    },
    disconnect: async () => {
      events.push("redis.disconnect");
      redisReady = false;
    },
    isReady: () => redisReady,
  };

  const lifecycle = createServerLifecycle({
    configProvider: () => config,
    appFactory: ({ getDependencyStatus }) => {
      events.push("app.create");
      assert.deepEqual(getDependencyStatus(), { mongodb: true, redis: true });
      return (_req, res) => res.end("ok");
    },
    database,
    cache,
    httpServerFactory: createServer,
    logger: silentLogger(),
    processRef,
  });

  const server = await lifecycle.start();
  assert.deepEqual(events.slice(0, 3), [
    "mongodb.connect",
    "redis.connect",
    "app.create",
  ]);
  assert.equal(server.listening, true);
  assert.equal(processRef.listenerCount("SIGINT"), 1);
  assert.equal(processRef.listenerCount("SIGTERM"), 1);

  await lifecycle.handleSignal("SIGTERM");
  assert.equal(server.listening, false);
  assert.equal(databaseReady, false);
  assert.equal(redisReady, false);
  assert.ok(events.includes("mongodb.disconnect"));
  assert.ok(events.includes("redis.disconnect"));
  assert.equal(processRef.listenerCount("SIGINT"), 0);
  assert.equal(processRef.listenerCount("SIGTERM"), 0);
});

test("startup failure does not listen and cleans up dependencies", async () => {
  const events = [];
  const database = {
    connect: async () => events.push("mongodb.connect"),
    disconnect: async () => events.push("mongodb.disconnect"),
    isReady: () => true,
  };
  const cache = {
    connect: async () => {
      events.push("redis.connect");
      throw new Error("Redis unavailable");
    },
    disconnect: async () => events.push("redis.disconnect"),
    isReady: () => false,
  };

  const lifecycle = createServerLifecycle({
    configProvider: () => config,
    appFactory: () => {
      throw new Error("Application must not be created");
    },
    database,
    cache,
    logger: silentLogger(),
    registerSignalHandlers: false,
  });

  await assert.rejects(lifecycle.start(), /Redis unavailable/);
  assert.deepEqual(events, [
    "mongodb.connect",
    "redis.connect",
    "mongodb.disconnect",
    "redis.disconnect",
  ]);
  assert.equal(lifecycle.getServer(), undefined);
});

test("configuration is validated before either dependency is contacted", async () => {
  let connectionAttempted = false;
  const lifecycle = createServerLifecycle({
    configProvider: () => {
      throw new Error("Invalid environment configuration");
    },
    database: {
      connect: async () => {
        connectionAttempted = true;
      },
      disconnect: async () => {},
      isReady: () => false,
    },
    cache: {
      connect: async () => {
        connectionAttempted = true;
      },
      disconnect: async () => {},
      isReady: () => false,
    },
    logger: silentLogger(),
    registerSignalHandlers: false,
  });

  await assert.rejects(lifecycle.start(), /Invalid environment configuration/);
  assert.equal(connectionAttempted, false);
});
