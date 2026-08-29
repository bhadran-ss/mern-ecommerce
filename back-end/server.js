import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getConfig } from "./config/env.js";
import {
  connectDatabase,
  disconnectDatabase,
  isDatabaseReady,
} from "./lib/db.js";
import { connectRedis, disconnectRedis, isRedisReady } from "./lib/Redis.js";
import { logger as defaultLogger } from "./lib/logger.js";

const listen = (server, port) =>
  new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      server.off("error", onError);
      resolve();
    };

    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port);
  });

const closeServer = (server) =>
  new Promise((resolve, reject) => {
    if (!server?.listening) {
      resolve();
      return;
    }

    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });

export const createServerLifecycle = ({
  configProvider = getConfig,
  appFactory,
  database = {
    connect: connectDatabase,
    disconnect: disconnectDatabase,
    isReady: isDatabaseReady,
  },
  cache = {
    connect: connectRedis,
    disconnect: disconnectRedis,
    isReady: isRedisReady,
  },
  httpServerFactory = createServer,
  logger = defaultLogger,
  processRef = process,
  registerSignalHandlers = true,
} = {}) => {
  let httpServer;
  let shutdownPromise;
  let handlersRegistered = false;

  const dependencyStatus = () => ({
    mongodb: database.isReady(),
    redis: cache.isReady(),
  });

  const signalHandlers = {
    SIGINT: () => void handleSignal("SIGINT"),
    SIGTERM: () => void handleSignal("SIGTERM"),
  };

  const removeSignalHandlers = () => {
    if (!handlersRegistered) {
      return;
    }

    processRef.off("SIGINT", signalHandlers.SIGINT);
    processRef.off("SIGTERM", signalHandlers.SIGTERM);
    handlersRegistered = false;
  };

  const stop = async (signal = "manual") => {
    if (shutdownPromise) {
      return shutdownPromise;
    }

    shutdownPromise = (async () => {
      logger.info("server.shutdown.started", { signal });
      removeSignalHandlers();

      await closeServer(httpServer);
      const results = await Promise.allSettled([
        database.disconnect(),
        cache.disconnect(),
      ]);
      const failures = results.filter((result) => result.status === "rejected");

      if (failures.length > 0) {
        throw new AggregateError(
          failures.map((failure) => failure.reason),
          "Failed to close server dependencies",
        );
      }

      logger.info("server.shutdown.completed", { signal });
    })();

    return shutdownPromise;
  };

  async function handleSignal(signal) {
    try {
      await stop(signal);
    } catch (error) {
      processRef.exitCode = 1;
      logger.error("server.shutdown.failed", { signal, error });
    }
  }

  const start = async () => {
    const config = configProvider();

    try {
      await database.connect(config.mongoUri);
      logger.info("dependency.mongodb.ready");

      await cache.connect(config.redisUrl);
      logger.info("dependency.redis.ready");

      const resolvedAppFactory =
        appFactory ?? (await import("./app.js")).createApp;
      const app = resolvedAppFactory({
        config,
        logger,
        getDependencyStatus: dependencyStatus,
      });

      httpServer = httpServerFactory(app);
      await listen(httpServer, config.port);

      if (registerSignalHandlers) {
        processRef.once("SIGINT", signalHandlers.SIGINT);
        processRef.once("SIGTERM", signalHandlers.SIGTERM);
        handlersRegistered = true;
      }

      logger.info("server.started", {
        port: config.port,
        environment: config.nodeEnv,
      });
      return httpServer;
    } catch (error) {
      await Promise.allSettled([
        closeServer(httpServer),
        database.disconnect(),
        cache.disconnect(),
      ]);
      logger.error("server.startup.failed", { error });
      throw error;
    }
  };

  return Object.freeze({
    start,
    stop,
    handleSignal,
    getServer: () => httpServer,
  });
};

export const startServer = async (options) => {
  const lifecycle = createServerLifecycle(options);
  await lifecycle.start();
  return lifecycle;
};

const isEntryPoint =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));

if (isEntryPoint) {
  startServer().catch((error) => {
    defaultLogger.error("server.fatal", { error });
    process.exitCode = 1;
  });
}
