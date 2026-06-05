// socket/setup/socketHandlers.js
import { registerEvents } from "../../events/index.js";
import { registerConnection } from "../../connection.handler.js";

export function setupSocketHandlers(io) {
  io.on("connection", async (socket) => {
    await registerConnection(io, socket);
    registerEvents(io, socket);
  });
}