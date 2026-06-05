import { EVENTS } from "../constants/events.constants.js";
import { onEvent } from "../utils/event.register.js";
import { redis } from "../../config/redis.js";
import { presenceSubscriptions } from "../utils/presenceSubscription.store.js";
import { presenceStore } from "../utils/presence.store.js";

export function registerPresenceEvents(io, socket) {

  onEvent(socket, EVENTS.PRESENCE.SUBSCRIBE, [], async (socket, { targetUserId }) => {

    //TODO validate user in DB and privacy policy

    presenceSubscriptions.subscribe(socket,targetUserId);

    const status = presenceStore.getStatus(targetUserId);

    socket.emit(EVENTS.PRESENCE.STATUS, {
      targetUserId,
      status:status
    });
  });

  onEvent(socket, EVENTS.PRESENCE.UNSUBSCRIBE, [], async (socket, { targetUserId }) => {
    presenceSubscriptions.unsubscribe(socket,targetUserId);
  });
}