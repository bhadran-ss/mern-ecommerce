import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

if (!process.env.UPSTASH_REDIS_URL) {
  throw new Error("UPSTASH_REDIS_URL is missing in the .env file");
}

const redis = new Redis(process.env.UPSTASH_REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redis.on("ready", () => console.log("✅ Redis ready"));
redis.on("error", (err) => console.error("❌ Redis:", err));

export default redis;
