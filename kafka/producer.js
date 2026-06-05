import kafka from "./client.js";

const producer = kafka.producer();

export const connectProducer = async () => {
  await producer.connect();
  console.log("producer connected.");
};

export async function publishEvent(topic, key, message) {
  if (!topic) {
    console.log("undefined in publish")
    throw new Error("Kafka publishEvent: topic is undefined");
  }

  console.log(topic)
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