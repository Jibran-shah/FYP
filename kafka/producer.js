import kafka from "./client.js";

const producer = kafka.producer();

let isConnected = false;

// -----------------------------
// CONNECT PRODUCER
// -----------------------------
export const connectProducer = async () => {
  await producer.connect();
  isConnected = true;
  console.log("Kafka producer connected.");
};

// -----------------------------
// PUBLISH EVENT
// -----------------------------
export async function publishEvent(topic, key, message) {
  if (!isConnected) {
    throw new Error("Kafka producer not connected");
  }

  if (!topic) {
    throw new Error("Kafka publishEvent: topic is undefined");
  }

  try {
    return await producer.send({
      topic,
      messages: [
        {
          key: String(key),
          value: JSON.stringify(message)
        }
      ]
    });
  } catch (err) {
    // IMPORTANT: don't crash socket flow
    console.error("Kafka publish failed:", err.message);

    // optional: you can push to retry queue later
    return null;
  }
}