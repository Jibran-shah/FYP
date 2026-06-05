import { EVENTS } from "../constants/events.constants.js";
import { onEvent } from "../utils/event.register.js";
import { presenceSubscriptions } from "../utils/presenceSubscription.store.js";
import { getUserRoom } from "../utils/room.store.js";

export function registerUserEvents(io, socket) {
    onEvent(socket,EVENTS.USER.REGISTER,[],async (socket) => {
      socket.join(getUserRoom(socket.user.id));
      socket.join(presenceSubscriptions.room(socket.user.id));
      console.log(getUserRoom(socket.user.id));
    })
}


