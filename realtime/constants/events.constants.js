export const EVENTS = {

  USER: {
    REGISTER: "user.register"
  },

  CHAT: {
    ROOM_JOIN: "chat.room.join",
    ROOM_LEAVE: "chat.room.leave",

    USER_JOINED: "chat.room.user_joined",
    USER_LEFT: "chat.room.user_left",

    MESSAGE_SEND: "chat.message.send",
    MESSAGE_SENT: "chat.message.sent",

    MESSAGE_DELIVERED: "chat.message.delivered",
    MESSAGE_READ: "chat.message.read",

    TYPING_START: "chat.typing.start",
    TYPING_STOP: "chat.typing.stop",

    MESSAGE_DLQ: "chat.message.dlq"
  },

  PRESENCE: {
    SUBSCRIBE: "presence.subscribe",
    UNSUBSCRIBE: "presence.unsubscribe",

    ONLINE: "presence.online",
    OFFLINE: "presence.offline",
    STATUS: "presence.status",
    LAST_SEEN: "presence.last_seen"
  }
};