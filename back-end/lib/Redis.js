import Redis from "ioredis";
import { logger } from "../utils/logger.js";

let redisClient;

export const connectToRedis = async (redisUrl) => {
  redisClient = new Redis(redisUrl, {
    lazyConnect: true,
    connectTimeout: 10_000,
    enableReadyCheck: true,
    maxRetriesPerRequest: 1,
    retryStrategy: (attempt) =>
      attempt <= 3 ? Math.min(attempt * 250, 1000) : null,
  });
  redisClient.on("error", (error) => {
    logger.error("Redis client error", { error });
  });

  await redisClient.connect();
  return redisClient;
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis has not been initialized.");
  }
  return redisClient;
};

export const disconnectFromRedis = async () => {
  if (!redisClient) return;

  const client = redisClient;
  redisClient = undefined;
  if (client.status !== "end") {
    await client.quit();
  }
};

export const getRedisReadiness = () => ({
  ready: redisClient?.status === "ready",
  status: redisClient?.status || "not_initialized",
});
