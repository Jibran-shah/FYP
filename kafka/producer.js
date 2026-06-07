import kafka from "./client.js";

const producer = kafka.producer();

export const connectProducer = async () => {
  await producer.connect();
  console.log("producer connected.");
};

export async function publishEvent(topic, key, message) {
  if (!topic) {
    throw new Error("Kafka publishEvent: topic is undefined");
  }
  
  return producer.send({
    topic,
    messages: [
      {
        key: String(key),
        value: JSON.stringify(message)
      }
    ]
  });
}