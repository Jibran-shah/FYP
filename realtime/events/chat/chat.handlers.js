import { publishEvent } from "../../../kafka/producer.js";
import { EVENTS } from "../../constants/events.constants.js";
import { canAccessRoom } from "../../services/chatAccess.service.js";
import { v4 as uuidv4 } from "uuid";

/*
=====================================================
ROOM JOIN
=====================================================
*/
export async function handleRoomJoin(socket, { roomId }) {
  const userId = socket.data?.user?.id;

  console.log(`📥 [ROOM_JOIN] socket=${socket.id} user=${userId} room=${roomId}`);

  const allowed = await canAccessRoom(socket, roomId);
  if (!allowed) {
    console.warn(`⛔ [ROOM_JOIN] access denied room=${roomId} user=${userId}`);
    return;
  }

  socket.join(roomId);

  console.log(`✅ [ROOM_JOIN] joined socket=${socket.id} room=${roomId}`);

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
  const userId = socket.data?.user?.id;

  console.log(`📤 [ROOM_LEAVE] socket=${socket.id} user=${userId} room=${roomId}`);

  socket.leave(roomId);

  console.log(`✅ [ROOM_LEAVE] left socket=${socket.id} room=${roomId}`);

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

  const userId = socket.data?.user?.id;

  console.log("📩 [MESSAGE_SEND] incoming message");
  console.log("➡️ socket:", socket.id);
  console.log("👤 user:", userId);
  console.log("🏠 room:", roomId);
  console.log("🧾 payload:", payload);

  const allowed = await canAccessRoom(socket, roomId);

  if (!allowed) {
    console.warn(`⛔ [MESSAGE_SEND] ACCESS_DENIED room=${roomId} user=${userId}`);

    socket.emit(EVENTS.CHAT.MESSAGE_FAILED, {
      roomId,
      tempId,
      reason: "ACCESS_DENIED",
      timestamp: Date.now()
    });

    return;
  }

  const messageId = uuidv4();

  const messageEvent = {
    type: EVENTS.CHAT.MESSAGE_SEND,
    messageId,
    roomId,
    tempId,
    senderId: userId,
    content,
    attachments,
    messageType: type,
    timestamp: Date.now()
  };

  try {
    console.log(`🚀 [MESSAGE_SEND] publishing to kafka room=${roomId}`);

    await publishEvent(EVENTS.CHAT.MESSAGE_SEND, roomId, messageEvent);

    console.log(`📡 [MESSAGE_SEND] broadcasting room=${roomId}`);

    io.to(roomId).emit(EVENTS.CHAT.MESSAGE_SEND, messageEvent);

    console.log(`✅ [MESSAGE_SEND] broadcast done messageId=${messageId}`);

    socket.emit(EVENTS.CHAT.MESSAGE_SENT, {
      roomId,
      tempId,
      messageId,
      status: "delivered",
      timestamp: Date.now()
    });
    
    console.log(`📨 [MESSAGE_SEND] ack sent to socket=${socket.id}`);
  } catch (err) {
    console.error("❌ [MESSAGE_SEND] failure:", err);

    socket.emit(EVENTS.CHAT.MESSAGE_FAILED, {
      roomId,
      tempId,
      reason: "INTERNAL_ERROR",
      timestamp: Date.now()
    });
  }
}

/*
=====================================================
MESSAGE DELIVERED
=====================================================
*/
export async function handleMessageDelivered(socket, { roomId, messageId }) {
  const userId = socket.data?.user?.id;

  console.log(`📦 [MESSAGE_DELIVERED] socket=${socket.id} room=${roomId} msg=${messageId}`);

  const allowed = await canAccessRoom(socket, roomId);
  if (!allowed) {
    console.warn(`⛔ [MESSAGE_DELIVERED] access denied room=${roomId}`);
    return;
  }

  const event = {
    type: EVENTS.CHAT.MESSAGE_DELIVERED,
    roomId,
    messageId,
    userId,
    timestamp: Date.now()
  };

  socket.to(roomId).emit(EVENTS.CHAT.MESSAGE_DELIVERED, event);

  console.log(`📡 [MESSAGE_DELIVERED] emitted room=${roomId}`);

  await publishEvent(EVENTS.CHAT.MESSAGE_DELIVERED, roomId, event);

  console.log(`📨 [MESSAGE_DELIVERED] published kafka room=${roomId}`);
}

/*
=====================================================
MESSAGE READ
=====================================================
*/
export async function handleMessageRead(socket, { roomId, messageId }) {
  const userId = socket.data?.user?.id;

  console.log(`👀 [MESSAGE_READ] socket=${socket.id} room=${roomId} msg=${messageId}`);

  const allowed = await canAccessRoom(socket, roomId);
  if (!allowed) {
    console.warn(`⛔ [MESSAGE_READ] access denied room=${roomId}`);
    return;
  }

  const event = {
    type: EVENTS.CHAT.MESSAGE_READ,
    roomId,
    messageId,
    userId,
    timestamp: Date.now()
  };

  socket.to(roomId).emit(EVENTS.CHAT.MESSAGE_READ, event);

  console.log(`📡 [MESSAGE_READ] emitted room=${roomId}`);

  await publishEvent(EVENTS.CHAT.MESSAGE_READ, roomId, event);

  console.log(`📨 [MESSAGE_READ] published kafka room=${roomId}`);
}

/*
=====================================================
TYPING START
=====================================================
*/
export async function handleTypingStart(socket, { roomId }) {
  const userId = socket.data?.user?.id;

  console.log(`⌨️ [TYPING_START] socket=${socket.id} user=${userId} room=${roomId}`);

  const allowed = await canAccessRoom(socket, roomId);
  if (!allowed) return;

  socket.to(roomId).emit(EVENTS.CHAT.TYPING_START, {
    roomId,
    userId
  });

  console.log(`📡 [TYPING_START] emitted room=${roomId}`);
}

/*
=====================================================
TYPING STOP
=====================================================
*/
export async function handleTypingStop(socket, { roomId }) {
  const userId = socket.data?.user?.id;

  console.log(`🛑 [TYPING_STOP] socket=${socket.id} user=${userId} room=${roomId}`);

  const allowed = await canAccessRoom(socket, roomId);
  if (!allowed) return;

  socket.to(roomId).emit(EVENTS.CHAT.TYPING_STOP, {
    roomId,
    userId
  });

  console.log(`📡 [TYPING_STOP] emitted room=${roomId}`);
}