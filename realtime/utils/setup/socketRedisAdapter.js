// socket/setup/socketRedisAdapter.js
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

export async function setupSocketRedisAdapter(io) {
  const pubClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
  });

  const subClient = pubClient.duplicate();

  await pubClient.connect();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));

  return {
    pubClient,
    subClient
  };
}