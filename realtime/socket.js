import { Server } from "socket.io";
import { socketAuth } from "./security/socketAuth.js";
import { setupSocketRedisAdapter } from "./utils/setup/socketRedisAdapter.js";
import { setupSocketHandlers } from "./utils/setup/socketHandlers.js";
import { connectProducer } from "../kafka/producer.js";

export async function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  io.use(socketAuth);

  await setupSocketRedisAdapter(io);
  //kafka producer setup
  await connectProducer();

  setupSocketHandlers(io);

  return io;
}