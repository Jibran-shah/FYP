import { publishEvent } from "../../../kafka/producer.js";
import { EVENTS } from "../../constants/events.constants.js";
import { canAccessRoom } from "../../services/chatAccess.service.js";
import { v4 as uuidv4 } from "uuid";
import {presenceStore} from "../../utils/presence.store.js"
import { notifyUser, sendPushNotification } from "../../../utils/sendNotification.js";

/*
=====================================================
ROOM JOIN
=====================================================
*/
export async function handleRoomJoin(socket, { roomId }) {
  const userId = socket.data?.user?.id;

  const allowed = await canAccessRoom(socket, roomId);
  if (!allowed) return;

  socket.join(roomId);

  socket.to(roomId).emit(EVENTS.CHAT.USER_JOINED, {
    roomId,
    userId,
    timestamp: Date.now(),
  });
}

/*
=====================================================
ROOM LEAVE
=====================================================
*/
export async function handleRoomLeave(socket, { roomId }) {
  const userId = socket.data?.user?.id;

  socket.leave(roomId);

  socket.to(roomId).emit(EVENTS.CHAT.USER_LEFT, {
    roomId,
    userId,
    timestamp: Date.now(),
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
    attachments = [],
    receiverId
  } = payload;

  const userId = socket.data?.user?.id;

  const allowed = await canAccessRoom(socket, roomId);
  if (!allowed) {
    socket.emit(EVENTS.CHAT.MESSAGE_FAILED, {
      roomId,
      tempId,
      reason: "ACCESS_DENIED",
      timestamp: Date.now(),
    });
    return;
  }

  const messageId = uuidv4();

  const messageEvent = {
    type: EVENTS.CHAT.MESSAGE_SEND,
    _id:messageId,
    tempId,
    roomId,
    chatId: roomId, 
    senderId: userId,
    text: content,    
    attachments,
    messageType: type,
    timestamp: Date.now(),
  };
  try {
    await publishEvent(EVENTS.CHAT.MESSAGE_SEND, roomId, messageEvent);
    io.to(roomId).emit(EVENTS.CHAT.MESSAGE_SEND, messageEvent);
    notifyUser({
      userId,
      title:"New Message",
      body:content,
      url:`chats/${roomId}`,
      data:{
        chatId:roomId
      }
    })
    socket.emit(EVENTS.CHAT.MESSAGE_SENT, {
      roomId,
      chatId: roomId,
      tempId,
      messageId,
      status: "delivered",
      timestamp: Date.now(),
    })
;
  } catch (err) {
    socket.emit(EVENTS.CHAT.MESSAGE_FAILED, {
      roomId,
      tempId,
      reason: "INTERNAL_ERROR",
      timestamp: Date.now(),
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

  const allowed = await canAccessRoom(socket, roomId);
  if (!allowed) return;

  const event = {
    type: EVENTS.CHAT.MESSAGE_DELIVERED,
    roomId,
    chatId: roomId,
    messageId,   // ✅ critical for frontend matching
    userId,
    timestamp: Date.now(),
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
  const userId = socket.data?.user?.id;

  const allowed = await canAccessRoom(socket, roomId);
  if (!allowed) return;

  const event = {
    type: EVENTS.CHAT.MESSAGE_READ,
    chatId: roomId,
    messageId,
    userId,
    timestamp: Date.now(),
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
  const userId = socket.data?.user?.id;

  const allowed = await canAccessRoom(socket, roomId);
  if (!allowed) return;

  socket.to(roomId).emit(EVENTS.CHAT.TYPING_START, {
    roomId,
    userId,
  });
}

/*
=====================================================
TYPING STOP
=====================================================
*/
export async function handleTypingStop(socket, { roomId }) {
  const userId = socket.data?.user?.id;

  const allowed = await canAccessRoom(socket, roomId);
  if (!allowed) return;

  socket.to(roomId).emit(EVENTS.CHAT.TYPING_STOP, {
    roomId,
    userId,
  });
}