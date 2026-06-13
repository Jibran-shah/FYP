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

  console.log("📡 Chat events registered:", socket.id);

  /*
  =====================================================
  ROOM JOIN
  =====================================================
  */
  onEvent(
    socket,
    EVENTS.CHAT.ROOM_JOIN,
    [requireAuth],
    (socket, payload) => handleRoomJoin(socket, payload)
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
    (socket, payload) => handleRoomLeave(socket, payload)
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
    (socket, payload) => handleMessageSend(io, socket, payload)
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
    (socket, payload) => handleMessageDelivered(socket, payload)
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
    (socket, payload) => handleMessageRead(socket, payload)
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
    (socket, payload) => handleTypingStart(socket, payload)
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
    (socket, payload) => handleTypingStop(socket, payload)
  );
}