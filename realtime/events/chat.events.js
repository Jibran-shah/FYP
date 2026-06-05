import { publishEvent } from "../../kafka/producer.js";
import { onEvent } from "../utils/event.register.js";
import { EVENTS } from "../constants/events.constants.js";
import { roomStore } from "../utils/room.store.js";
import { requireAuth } from "../security/guards.js";

/*
=====================================================
HELPER (centralized guard)
=====================================================
*/
const canAccessRoom = async (socket, roomId) => {
  const userId = socket.user.id;

  // you can also attach room type in socket or fetch it dynamically
  const typeModel = socket.roomsMeta?.[roomId] || "DIRECT_CHAT";

  return roomStore.validateAccess(roomId, userId, typeModel);
};

/*
=====================================================
REGISTER EVENTS
=====================================================
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
    async (socket, { roomId }) => {

      const userId = socket.user.id;

      const isAllowed = await canAccessRoom(socket, roomId);

      if (!isAllowed) return;

      socket.join(roomId);

      socket.to(roomId).emit(EVENTS.CHAT.USER_JOINED, {
        roomId,
        userId,
        timestamp: Date.now()
      });
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
    async (socket, { roomId }) => {

      const userId = socket.user.id;

      socket.leave(roomId);

      socket.to(roomId).emit(EVENTS.CHAT.USER_LEFT, {
        roomId,
        userId,
        timestamp: Date.now()
      });
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

      const {
        roomId,
        content,
        tempId,
        type = "text",
        attachments = []
      } = payload;

      const userId = socket.user.id;

      const isAllowed = await canAccessRoom(socket, roomId);

      if (!isAllowed) return;

      const messageEvent = {
        type: EVENTS.CHAT.MESSAGE_SEND,
        roomId,
        tempId,
        senderId: userId,
        content,
        attachments,
        messageType: type,
        timestamp: Date.now()
      };

      io.to(roomId).emit(EVENTS.CHAT.MESSAGE_SEND, messageEvent);

      await publishEvent(EVENTS.CHAT.MESSAGE_SEND, roomId, messageEvent);

      socket.emit(EVENTS.CHAT.MESSAGE_SENT, {
        roomId,
        tempId,
        status: "queued",
        timestamp: Date.now()
      });
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
    async (socket, { roomId, messageId }) => {

      const userId = socket.user.id;

      const isAllowed = await canAccessRoom(socket, roomId);

      if (!isAllowed) return;

      const event = {
        type: EVENTS.CHAT.MESSAGE_DELIVERED,
        roomId,
        messageId,
        userId,
        timestamp: Date.now()
      };

      socket.to(roomId).emit(EVENTS.CHAT.MESSAGE_DELIVERED, event);

      await publishEvent(EVENTS.CHAT.MESSAGE_DELIVERED, roomId, event);
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
    async (socket, { roomId, messageId }) => {

      const userId = socket.user.id;

      const isAllowed = await canAccessRoom(socket, roomId);

      if (!isAllowed) return;

      const event = {
        type: EVENTS.CHAT.MESSAGE_READ,
        roomId,
        messageId,
        userId,
        timestamp: Date.now()
      };

      socket.to(roomId).emit(EVENTS.CHAT.MESSAGE_READ, event);

      await publishEvent(EVENTS.CHAT.MESSAGE_READ, roomId, event);
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
    async (socket, { roomId }) => {

      const userId = socket.user.id;

      const isAllowed = await canAccessRoom(socket, roomId);

      if (!isAllowed) return;

      socket.to(roomId).emit(EVENTS.CHAT.TYPING_START, {
        roomId,
        userId
      });
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
    async (socket, { roomId }) => {

      const userId = socket.user.id;

      const isAllowed = await canAccessRoom(socket, roomId);

      if (!isAllowed) return;

      socket.to(roomId).emit(EVENTS.CHAT.TYPING_STOP, {
        roomId,
        userId
      });
    }
  );
}