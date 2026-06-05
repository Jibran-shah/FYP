import { Kafka } from "kafkajs";

export default new Kafka({
  clientId: "realtime-bus",
  brokers: ["localhost:29092"],
  connectionTimeout: 3000,
  requestTimeout: 30000
});