import { Server } from "socket.io";
import { socketAuth } from "./security/socketAuth.js";
import { setupSocketRedisAdapter } from "./utils/setup/socketRedisAdapter.js";
import { connectProducer } from "../kafka/producer.js";
import { registerPlugins } from "./plugins/registorPlugins.js";

export async function initSocket(server) {
  console.log("🚀 [Socket] Initializing Socket.IO server...");

  const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map(o => o.trim());

  console.log("🌐 [Socket] Allowed origins:", allowedOrigins);

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  console.log("⚙️ [Socket] Socket.IO instance created");

  io.use((socket, next) => {
    console.log(`🔐 [Socket] Authenticating socket: ${socket.id}`);
    socketAuth(socket, next);
  });

  try {
    console.log("🔧 [Socket] Initializing infrastructure (Redis + Kafka)...");

    await Promise.all([
      setupSocketRedisAdapter(io),
      connectProducer()
    ]);

    console.log("✅ [Socket] Infrastructure initialized successfully (Redis + Kafka)");
  } catch (err) {
    console.error("❌ [Socket] Infrastructure init failed:", err);
    throw err;
  }

  io.on("connection", async (socket) => {
    console.log(`🟢 [Socket] Client connected: ${socket.id}`);

    /**
     * ==========================================
     * 🔍 DEBUG: Catch ALL frontend events
     * ==========================================
     */
    socket.onAny((event, ...args) => {
      console.log("📥 [Socket EVENT RECEIVED]");
      console.log("➡️ Event:", event);
      console.log("🧾 Payload:", args);
    });

    socket.on("disconnect", (reason) => {
      console.log(
        `🔴 [Socket] Client disconnected: ${socket.id} | reason: ${reason}`
      );
    });

    try {
      console.log(`🧩 [Socket] Registering plugins for: ${socket.id}`);

      await registerPlugins(io, socket);

      console.log(`✅ [Socket] Plugins registered successfully for: ${socket.id}`);
    } catch (err) {
      console.error(
        `❌ [Socket] Plugin registration failed for ${socket.id}:`,
        err
      );

      console.log(`⚠️ [Socket] Force disconnecting socket: ${socket.id}`);
      socket.disconnect(true);
    }
  });

  console.log("🎯 [Socket] Socket.IO server initialized successfully");

  return io;
}