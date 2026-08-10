import { ApiError } from "../utils/apiError.js";
import { env } from "./env.js";
import { Redis, RedisOptions } from "ioredis";

if (!env.IOREDIS_URL) {
  throw new ApiError(409, "IOREDIS_URL environment variable is not defined");
}

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  lazyConnect: true,
};

export const redis = new Redis(env.IOREDIS_URL, redisOptions);
