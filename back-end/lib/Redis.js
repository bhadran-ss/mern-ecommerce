import Redis from "ioredis";
import config from "../config/env.js";
import { logger } from "./logger.js";

const redis = new Redis(config.UPSTASH_REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  commandTimeout: 5000,
});

redis.on("ready", () => logger.info("redis.ready"));
redis.on("error", (error) =>
  logger.error("redis.connection_error", { errorName: error?.name || "Error" }),
);

export const connectRedis = async () => {
  let timeout;
  try {
    if (redis.status === "wait") {
      await Promise.race([
        redis.connect(),
        new Promise((_, reject) => {
          timeout = setTimeout(
            () => reject(new Error("Redis connection timed out.")),
            10000,
          );
        }),
      ]);
    }
    await redis.ping();
  } catch (error) {
    redis.disconnect();
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

export const isRedisReady = async () => {
  if (redis.status !== "ready") {
    return false;
  }
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
};

export const disconnectRedis = async () => {
  if (redis.status === "ready") {
    await redis.quit();
    return;
  }
  if (redis.status !== "end") {
    redis.disconnect();
  }
};

export default redis;
