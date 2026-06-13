import { publishEvent } from "../../../kafka/producer.js";
import { EVENTS } from "../../constants/events.constants.js";
import { canAccessRoom } from "../../services/chatAccess.service.js";

/*
=====================================================
ROOM JOIN
=====================================================
*/
export async function handleRoomJoin(socket, { roomId }) {

  const userId = socket.user.id;

  const allowed = await canAccessRoom(socket, roomId);
  if (!allowed) return;

  socket.join(roomId);

  socket.to(roomId).emit(EVENTS.CHAT.USER_JOINED, {
    roomId,
    userId,
    timestamp: Date.now()
  });
}

/*
=====================================================
ROOM LEAVE
=====================================================
*/
export async function handleRoomLeave(socket, { roomId }) {

  const userId = socket.user.id;

  socket.leave(roomId);

  socket.to(roomId).emit(EVENTS.CHAT.USER_LEFT, {
    roomId,
    userId,
    timestamp: Date.now()
  });
}

/*
=====================================================
MESSAGE SEND
=====================================================
*/
export async function handleMessageSend(io, socket, payload) {

  const {
    roomId,
    content,
    tempId,
    type = "text",
    attachments = []
  } = payload;

  const userId = socket.user.id;

  const allowed = await canAccessRoom(socket, roomId);
  if (!allowed) return;

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

/*
=====================================================
MESSAGE DELIVERED
=====================================================
*/
export async function handleMessageDelivered(socket, { roomId, messageId }) {

  const userId = socket.user.id;

  const allowed = await canAccessRoom(socket, roomId);
  if (!allowed) return;

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

/*
=====================================================
MESSAGE READ
=====================================================
*/
export async function handleMessageRead(socket, { roomId, messageId }) {

  const userId = socket.user.id;

  const allowed = await canAccessRoom(socket, roomId);
  if (!allowed) return;

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

/*
=====================================================
TYPING START
=====================================================
*/
export async function handleTypingStart(socket, { roomId }) {

  const userId = socket.user.id;

  const allowed = await canAccessRoom(socket, roomId);
  if (!allowed) return;

  socket.to(roomId).emit(EVENTS.CHAT.TYPING_START, {
    roomId,
    userId
  });
}

/*
=====================================================
TYPING STOP
=====================================================
*/
export async function handleTypingStop(socket, { roomId }) {

  const userId = socket.user.id;

  const allowed = await canAccessRoom(socket, roomId);
  if (!allowed) return;

  socket.to(roomId).emit(EVENTS.CHAT.TYPING_STOP, {
    roomId,
    userId
  });
}