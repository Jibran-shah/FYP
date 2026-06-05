import { EVENTS } from "../../realtime/constants/events.constants.js";
import client from "../client.js";
import { handleKafkaBatch } from "./kafka.handler.js";

const kafka = client;

export const consumer = kafka.consumer({
  groupId: "chat-consumers"
});

export const runConsumer = async () => {
  await consumer.connect();

  await consumer.subscribe({
    topics: [
      EVENTS.CHAT.MESSAGE_SEND,
      EVENTS.CHAT.MESSAGE_READ,
      EVENTS.CHAT.MESSAGE_DELIVERED,
      EVENTS.CHAT.MESSAGE_DLQ
    ],
    fromBeginning: false
  });

  await consumer.run({
    eachBatch: async ({ batch }) => {
        const topic = batch.topic;
        const events = [];
        for (const m of batch.messages) {
            try {
            events.push(JSON.parse(m.value.toString()));
            } catch (err) {
            events.push({
                __invalid: true,
                raw: m.value?.toString()
            });
            }
        }

        console.log(topic,events);

        if (events.length) {
            await handleKafkaBatch(topic, events);
        }
        }
    });
};