import Redis from "ioredis";
import { getConfig } from "../config/env.js";

const { redisUrl } = getConfig();

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redis.on("ready", () => console.log("✅ Redis ready"));
redis.on("error", (err) => console.error("❌ Redis:", err));

export default redis;
