import { Server } from "socket.io";
import { socketAuth } from "./security/socketAuth.js";
import { setupSocketRedisAdapter } from "./utils/setup/socketRedisAdapter.js";
import { connectProducer } from "../kafka/producer.js";
import { registerPlugins } from "./plugins/registorPlugins.js";

export async function initSocket(server) {

  const io = new Server(server, {
    cors: { origin: "*" }
  });

  // -------------------------
  // SECURITY LAYER
  // -------------------------
  io.use(socketAuth);

  // -------------------------
  // INFRA LAYER (BOOTSTRAP ONLY)
  // -------------------------
  try {
    await Promise.all([
      setupSocketRedisAdapter(io),
      connectProducer()
    ]);
  } catch (err) {
    console.error("Socket infra init failed:", err);
    throw err;
  }

  // -------------------------
  // PLUGIN REGISTRATION (EVENT WIRING ONLY)
  // -------------------------
  io.on("connection", (socket) => {
    registerPlugins(io, socket);
  });

  return io;
}