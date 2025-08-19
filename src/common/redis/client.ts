import { Redis } from "ioredis";
import { config } from "../../config/index.js";

export const redis = new Redis(config.app["redis_url"]);
export async function connectRedis() {
  redis.on("error", (e: any) => console.error("Redis error:", e));
}
