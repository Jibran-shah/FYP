import "./env.js"
import { createTopics } from "./kafka/admin.js";
import { connectProducer } from "./kafka/producer.js";
import { runConsumer } from "./kafka/consumers/consumer.js";
import dotenv from "dotenv";
import { EVENTS } from "./realtime/constants/events.constants.js";
import connectDB from "./config/db.js";

dotenv.config({ path: "./kafka-setup/.env" });
dotenv.config({ })

process.env.KAFKAJS_NO_PARTITIONER_WARNING = "1";

const start = async () => {
  await connectDB();
  if (process.env.NODE_ENV !== "production") {
    createTopics([
    { topic: EVENTS.CHAT.MESSAGE_SEND, partitions: 3 },
    { topic: EVENTS.CHAT.MESSAGE_DELIVERED, partitions: 3 },
    { topic: EVENTS.CHAT.MESSAGE_READ, partitions: 3 },
    { topic: EVENTS.CHAT.MESSAGE_DLQ, partitions: 3}
  ]);
  }
  await connectProducer();
  await runConsumer();
};

start();