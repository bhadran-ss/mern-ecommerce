import Redis from "ioredis";
import config from "../config/env.js";

const redis = new Redis(config.UPSTASH_REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redis.on("ready", () => console.log("✅ Redis ready"));
redis.on("error", (err) => console.error("❌ Redis:", err));

export default redis;
