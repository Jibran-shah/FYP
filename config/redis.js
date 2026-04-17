import Redis from "ioredis";

export const redisConnection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

export const redis = new Redis({
  host: redisConnection.host,
  port: redisConnection.port,
  password: redisConnection.password,
  lazyConnect: false,
});

redis.on("connect", () =>
  console.log("✅ Redis connecting...")
);

redis.on("ready", () =>
  console.log("🚀 Redis ready")
);

redis.on("error", (err) =>
  console.error("❌ Redis error:", err.message)
);