import { connectionPlugin } from "./connection.plugin.js";
import { chatPlugin } from "./chat.plugin.js";
import { presencePlugin } from "./presence.plugin.js";

export function registerPlugins(io, socket) {

  try {
    // -----------------------------
    // LIFECYCLE FIRST (must always run first)
    // -----------------------------
    connectionPlugin(io, socket);

    // -----------------------------
    // STATE LAYER
    // -----------------------------
    presencePlugin(io, socket);

    // -----------------------------
    // DOMAIN EVENTS
    // -----------------------------
    chatPlugin(io, socket);

  } catch (err) {
    console.error("Plugin registration failed:", err.message);
  }
}