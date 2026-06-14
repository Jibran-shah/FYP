import { onEvent } from "../../utils/event.register.js";
import { EVENTS } from "../../constants/events.constants.js";
import { requireAuth } from "../../security/guards.js";

import {
  handleRoomJoin,
  handleRoomLeave,
  handleMessageSend,
  handleMessageDelivered,
  handleMessageRead,
  handleTypingStart,
  handleTypingStop
} from "./chat.handlers.js";

/**
 * Chat Events Registration Layer
 * ONLY maps events → handlers
 */
export function registerChatEvents(io, socket) {

  console.log("📡 [CHAT] Events registered for socket:", socket.id);

  /*
  =====================================================
  ROOM JOIN
  =====================================================
  */
  onEvent(
    socket,
    EVENTS.CHAT.ROOM_JOIN,
    [requireAuth],
    async (socket, payload) => {
      console.log("➡️ [ROOM_JOIN] event received");
      console.log("🔹 socket:", socket.id);
      console.log("🔹 payload:", payload);

      const result = await handleRoomJoin(socket, payload);

      console.log("✅ [ROOM_JOIN] completed");
      return result;
    }
  );

  /*
  =====================================================
  ROOM LEAVE
  =====================================================
  */
  onEvent(
    socket,
    EVENTS.CHAT.ROOM_LEAVE,
    [requireAuth],
    async (socket, payload) => {
      console.log("⬅️ [ROOM_LEAVE] event received");
      console.log("🔹 socket:", socket.id);
      console.log("🔹 payload:", payload);

      const result = await handleRoomLeave(socket, payload);

      console.log("✅ [ROOM_LEAVE] completed");
      return result;
    }
  );

  /*
  =====================================================
  MESSAGE SEND
  =====================================================
  */
  onEvent(
    socket,
    EVENTS.CHAT.MESSAGE_SEND,
    [requireAuth],
    async (socket, payload) => {
      console.log("💬 [MESSAGE_SEND] event received");
      console.log("🔹 socket:", socket.id);
      console.log("🔹 payload:", payload);

      const result = await handleMessageSend(io, socket, payload);

      console.log("✅ [MESSAGE_SEND] completed");
      return result;
    }
  );

  /*
  =====================================================
  MESSAGE DELIVERED
  =====================================================
  */
  onEvent(
    socket,
    EVENTS.CHAT.MESSAGE_DELIVERED,
    [requireAuth],
    async (socket, payload) => {
      console.log("📦 [MESSAGE_DELIVERED] event received");
      console.log("🔹 socket:", socket.id);
      console.log("🔹 payload:", payload);

      const result = await handleMessageDelivered(socket, payload);

      console.log("✅ [MESSAGE_DELIVERED] completed");
      return result;
    }
  );

  /*
  =====================================================
  MESSAGE READ
  =====================================================
  */
  onEvent(
    socket,
    EVENTS.CHAT.MESSAGE_READ,
    [requireAuth],
    async (socket, payload) => {
      console.log("👀 [MESSAGE_READ] event received");
      console.log("🔹 socket:", socket.id);
      console.log("🔹 payload:", payload);

      const result = await handleMessageRead(socket, payload);

      console.log("✅ [MESSAGE_READ] completed");
      return result;
    }
  );

  /*
  =====================================================
  TYPING START
  =====================================================
  */
  onEvent(
    socket,
    EVENTS.CHAT.TYPING_START,
    [requireAuth],
    async (socket, payload) => {
      console.log("⌨️ [TYPING_START] event received");
      console.log("🔹 socket:", socket.id);
      console.log("🔹 payload:", payload);

      const result = await handleTypingStart(socket, payload);

      console.log("✅ [TYPING_START] completed");
      return result;
    }
  );

  /*
  =====================================================
  TYPING STOP
  =====================================================
  */
  onEvent(
    socket,
    EVENTS.CHAT.TYPING_STOP,
    [requireAuth],
    async (socket, payload) => {
      console.log("🛑 [TYPING_STOP] event received");
      console.log("🔹 socket:", socket.id);
      console.log("🔹 payload:", payload);

      const result = await handleTypingStop(socket, payload);

      console.log("✅ [TYPING_STOP] completed");
      return result;
    }
  );
}