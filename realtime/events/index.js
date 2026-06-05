import { onEvent } from "../utils/event.register.js";
import { registerChatEvents } from "./chat.events.js";
import { registerUserEvents } from "./user.events.js";

export function registerEvents(io,socket) {
    registerUserEvents(io, socket);
    registerChatEvents(io, socket);
}