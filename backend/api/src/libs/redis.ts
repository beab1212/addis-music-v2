import { Redis } from "ioredis";
import config from "../config/config";
import { reddit } from "better-auth/social-providers";

export const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  db: config.redis.db,
  username: config.redis.username,
  password: config.redis.password,
});

