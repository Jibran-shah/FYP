import { connectionPlugin } from "./connection.plugin.js";
import { chatPlugin } from "./chat.plugin.js";
import { presencePlugin } from "./presence.plugin.js";

export function registerPlugins(io, socket) {
  console.log(`[Plugins] Registering plugins for socket: ${socket.id}`);

  try {
    // -----------------------------
    // LIFECYCLE FIRST (must always run first)
    // -----------------------------
    console.log(`[Plugins] Loading connectionPlugin → ${socket.id}`);
    connectionPlugin(io, socket);
    console.log(`[Plugins] connectionPlugin loaded → ${socket.id}`);

    // -----------------------------
    // STATE LAYER
    // -----------------------------
    console.log(`[Plugins] Loading presencePlugin → ${socket.id}`);
    presencePlugin(io, socket);
    console.log(`[Plugins] presencePlugin loaded → ${socket.id}`);

    // -----------------------------
    // DOMAIN EVENTS
    // -----------------------------
    console.log(`[Plugins] Loading chatPlugin → ${socket.id}`);
    chatPlugin(io, socket);
    console.log(`[Plugins] chatPlugin loaded → ${socket.id}`);

    console.log(`[Plugins] All plugins successfully registered → ${socket.id}`);

  } catch (err) {
    console.error(
      `[Plugins] Plugin registration failed for socket ${socket.id}:`,
      err.message
    );
  }
}