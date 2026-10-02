import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import app from "./app.js";
import config from "./config/env.js";
import { disconnectDB, connectDB } from "./lib/db.js";
import { connectRedis, disconnectRedis } from "./lib/Redis.js";
import { logger } from "./lib/logger.js";

let server;
let shutdownPromise;

const closeHttpServer = () =>
  new Promise((resolve) => {
    if (!server?.listening) {
      resolve();
      return;
    }
    server.close((error) => {
      if (error) {
        logger.error("server.http_close_failed", {
          errorName: error.name || "Error",
        });
      }
      resolve();
    });
  });

export const shutdown = (signal = "manual") => {
  if (shutdownPromise) {
    return shutdownPromise;
  }

  shutdownPromise = (async () => {
    logger.info("server.shutdown_started", { signal });
    await closeHttpServer();

    const results = await Promise.allSettled([disconnectDB(), disconnectRedis()]);
    for (const result of results) {
      if (result.status === "rejected") {
        logger.error("server.dependency_close_failed", {
          errorName: result.reason?.name || "Error",
        });
        process.exitCode = 1;
      }
    }

    logger.info("server.shutdown_complete", { signal });
  })();

  return shutdownPromise;
};

export const startServer = async () => {
  try {
    await connectDB();
    logger.info("database.connected");

    await connectRedis();
    logger.info("redis.connected");

    server = createServer(app);
    await new Promise((resolve, reject) => {
      const onError = (error) => reject(error);
      server.once("error", onError);
      server.listen(config.PORT, () => {
        server.off("error", onError);
        resolve();
      });
    });

    logger.info("server.listening", { port: config.PORT });
    process.once("SIGINT", () => void shutdown("SIGINT"));
    process.once("SIGTERM", () => void shutdown("SIGTERM"));
    return server;
  } catch (error) {
    logger.error("server.startup_failed", {
      errorName: error?.name || "Error",
      errorCode: error?.code,
    });
    const results = await Promise.allSettled([disconnectDB(), disconnectRedis()]);
    if (results.some((result) => result.status === "rejected")) {
      logger.error("server.startup_cleanup_failed");
    }
    process.exitCode = 1;
    return null;
  }
};

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (invokedFile === currentFile) {
  void startServer();
}
