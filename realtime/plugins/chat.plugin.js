import { registerChatEvents } from "../events/chat/chat.events.js";

/**
 * Chat plugin:
 * Responsible for initializing chat domain events
 * and future chat-level middleware/hooks.
 */
export function chatPlugin(io, socket) {

  // register all chat domain events
  registerChatEvents(io, socket);

  // FUTURE HOOK PLACEHOLDER (intentionally empty but reserved)
  // - typing middleware
  // - rate limiting per socket
  // - chat-level guards
}