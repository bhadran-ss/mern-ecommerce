import Redis from "ioredis";

import { logger } from "./logger.js";

let redisClient;

const createRedisClient = (redisUrl) => {
  const client = new Redis(redisUrl, {
    lazyConnect: true,
    enableReadyCheck: true,
    maxRetriesPerRequest: 1,
    connectTimeout: 10_000,
    retryStrategy: (attempt) =>
      attempt <= 3 ? Math.min(attempt * 200, 1_000) : null,
  });

  client.on("error", (error) => {
    logger.error("dependency.redis.error", { error });
  });

  return client;
};

export const connectRedis = async (redisUrl) => {
  if (!redisClient || redisClient.status === "end") {
    redisClient = createRedisClient(redisUrl);
  }

  if (redisClient.status === "wait") {
    await redisClient.connect();
  }

  await redisClient.ping();
  return redisClient;
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis is not initialized");
  }

  return redisClient;
};

export const disconnectRedis = async () => {
  if (!redisClient || redisClient.status === "end") {
    return;
  }

  try {
    await redisClient.quit();
  } catch {
    redisClient.disconnect();
  }
};

export const isRedisReady = () => redisClient?.status === "ready";
