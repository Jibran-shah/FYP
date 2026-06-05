import kafka from "./client.js";

export const createTopics = async (topics = []) => {
  const admin = kafka.admin();
  await admin.connect();
  const existing = await admin.listTopics();
  console.log("EXISTING TOPICS:", existing);
  const toCreate = topics.filter(t => !existing.includes(t.topic));

  if (toCreate.length) {
    await admin.createTopics({
      topics: toCreate.map(t => ({
        topic: t.topic,
        numPartitions: t.partitions || 3
      }))
    });
  }

  await admin.disconnect();
};