import { presenceStore } from "./utils/presence.store.js";
import { presenceSubscriptions } from "./utils/presenceSubscription.store.js";
import { roomStore } from "../realtime/utils/room.store.js";
import { DirectChat } from "../models/DirectChat.model.js";
import { GroupChat } from "../models/GroupChat.model.js";

export const registerConnection = async (io, socket) => {

  const userId = socket.user.id;

  /*
  =====================================================
  1. PRESENCE TRACKING
  =====================================================
  */
  const { socketCount } = await presenceStore.addSocket(userId, socket.id);

  console.log("socketCount:", socketCount);

  if (socketCount === 1) {
    presenceSubscriptions.emitOnline(io, userId);
  }

  /*
  =====================================================
  2. HYDRATE USER ROOMS (Mongo → Redis → Socket)
  =====================================================
  */

  try {

    // 🔥 DIRECT CHATS
    const directChats = await DirectChat.find({
      participants: userId,
      isDeleted: false
    }).select("_id participants");

    // 🔥 GROUP CHATS
    const groupChats = await GroupChat.find({
      "members.userId": userId,
      isDeleted: false
    }).select("_id members");

    const rooms = [];

    /*
    =====================================================
    3. HYDRATE REDIS + BUILD ROOM LIST
    =====================================================
    */

    for (const chat of directChats) {

      const roomId = chat._id.toString();

      rooms.push(roomId);

      await roomStore.create({
        roomId,
        type: "DIRECT_CHAT",
        members: chat.participants.map(String)
      });
    }

    for (const group of groupChats) {

      const roomId = group._id.toString();

      rooms.push(roomId);

      const members = group.members
        .filter(m => m.isActive)
        .map(m => m.userId.toString());

      await roomStore.create({
        roomId,
        type: "GROUP_CHAT",
        members
      });
    }

    /*
    =====================================================
    4. SOCKET JOIN ROOMS
    =====================================================
    */

    for (const roomId of rooms) {
      socket.join(roomId);
    }

    console.log(`socket ${socket.id} joined ${rooms.length} rooms`);

    /*
    =====================================================
    5. READY EVENT (client sync signal)
    =====================================================
    */

    socket.emit("CONNECTION_READY", {
      userId,
      roomsCount: rooms.length,
      timestamp: Date.now()
    });

  } catch (err) {
    console.error("Room hydration error:", err.message);
  }

  /*
  =====================================================
  6. DISCONNECT HANDLING
  =====================================================
  */

  socket.on("disconnect", async () => {
    try {

      const { socketCount } = await presenceStore.removeSocket(userId, socket.id);

      if (socketCount === 0) {
        presenceSubscriptions.emitOffline(io, userId);
      }

    } catch (err) {
      console.error("Disconnect error:", err.message);
    }
  });

  /*
  =====================================================
  7. SOCKET ERROR HANDLING
  =====================================================
  */

  socket.on("connect_error", (err) => {
    console.log("CONNECT ERROR:", err.message);
  });
};