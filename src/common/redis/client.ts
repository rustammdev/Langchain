import { createClient } from "redis";
import { config } from "../../config/index.js";

export const redis = createClient({ url: config.app["redis_url"] });
export async function connectRedis() {
  if (!redis.isOpen) await redis.connect();

  redis.on("error", (e) => console.error("Rdeis error:", e));
}
