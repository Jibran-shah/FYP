import { createClient } from "redis";
import { DatabaseError } from "../errors/index.js";

// ----------------------
// BullMQ connection (pure config)
// ----------------------
export const redisConnection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined
};

// ----------------------
// App Redis Client
// ----------------------
export const redisClient = createClient({
  socket: {
    host: redisConnection.host,
    port: redisConnection.port
  },
  password: redisConnection.password
});

// ----------------------
// Events
// ----------------------
redisClient.on("connect", () => console.log("✅ Redis Client Connected"));
redisClient.on("error", (err) =>
  console.error("❌ Redis Client Error:", err.message)
);

// ----------------------
// Connect function (SAFE)
// ----------------------
export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("🚀 Redis Client Ready");
    }
  } catch (error) {
    throw new DatabaseError(
      `Redis connection failed: ${error.message}`
    );
  }
};