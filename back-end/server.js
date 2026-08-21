import dotenv from "dotenv";

import { createApp } from "./app.js";
import { initializeDependencies } from "./bootstrap.js";
import { configureCloudinary } from "./config/cloudinary.js";
import { initializeEnvironment } from "./config/env.js";
import {
  connectToDatabase,
  disconnectFromDatabase,
  getDatabaseReadiness,
} from "./lib/db.js";
import {
  connectToRedis,
  disconnectFromRedis,
  getRedisReadiness,
} from "./lib/Redis.js";
import { initializeStripe } from "./lib/stripe.js";
import { logger } from "./utils/logger.js";
import { createShutdown, registerShutdownHandlers } from "./utils/shutdown.js";

dotenv.config({ quiet: true });

const listen = (app, port) =>
  new Promise((resolve, reject) => {
    const server = app.listen(port);
    server.once("listening", () => resolve(server));
    server.once("error", reject);
  });

const startServer = async () => {
  const config = initializeEnvironment(process.env);
  await initializeDependencies({
    config,
    logger,
    configureCloudinary,
    initializeStripe,
    connectDatabase: connectToDatabase,
    connectRedis: connectToRedis,
  });

  const getReadiness = () => {
    const database = getDatabaseReadiness();
    const redis = getRedisReadiness();
    return {
      ready: database.ready && redis.ready,
      services: { database, redis },
    };
  };

  const app = createApp({ config, logger, getReadiness });
  const server = await listen(app, config.port);
  logger.info("HTTP server started", {
    port: config.port,
    environment: config.nodeEnv,
  });

  const shutdown = createShutdown({
    server,
    logger,
    disconnectDatabase: disconnectFromDatabase,
    disconnectRedis: disconnectFromRedis,
  });
  registerShutdownHandlers({ shutdown, logger });

  return { app, server, shutdown };
};

startServer().catch(async (error) => {
  logger.error("Application startup failed", { error });
  await Promise.allSettled([disconnectFromDatabase(), disconnectFromRedis()]);
  process.exitCode = 1;
});
