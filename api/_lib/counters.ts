import type { Redis } from "@upstash/redis";
import type { CounterStore } from "../../shared/rateLimit";

export function counterStore(redis: Redis): CounterStore {
  return {
    incr: (key) => redis.incr(key),
    expire: (key, seconds) => redis.expire(key, seconds),
    ttl: async (key) => {
      const ttl = await redis.ttl(key);
      return typeof ttl === "number" ? ttl : Number(ttl);
    },
  };
}
