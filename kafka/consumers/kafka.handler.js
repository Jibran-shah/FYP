import { messageSendConsumer } from "./chat/messageSend.consumer.js";
import { messageDeliveredConsumer } from "./chat/messageDelivered.consumer.js";
import { messageReadConsumer } from "./chat/messageRead.consumer.js";
import { dlqConsumer } from "./chat/dlq.consumer.js";
import { EVENTS } from "../../realtime/constants/events.constants.js";

export async function handleKafkaBatch(topic, events) {

  if (!events?.length) return;

  console.log("🔥 RAW TOPIC RECEIVED =>", JSON.stringify(topic));
  console.log("🔥 TYPE =>", typeof topic);

  switch (topic) {
    case EVENTS.CHAT.MESSAGE_SEND:
      return messageSendConsumer(events);
    case EVENTS.CHAT.MESSAGE_DELIVERED:
      return messageDeliveredConsumer(events);
    case EVENTS.CHAT.MESSAGE_READ:
      return messageReadConsumer(events);
    case EVENTS.CHAT.MESSAGE_DLQ:
      return dlqConsumer(events);
    default:
      console.warn("Unknown topic:", topic);
  }

}