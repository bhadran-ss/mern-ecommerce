import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const redis = new Redis(process.env.UPSTASH_REDIS_URL);

export default redis;
