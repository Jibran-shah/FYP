import { Message } from "../../../models/Message.model.js";

export async function messageSendConsumer(events) {
  console.log("📥 [MESSAGE_CONSUMER] Batch received");
  console.log("📊 Total events:", events.length);

  try {
    const ops = [];

    for (const e of events) {
      if (e?.__invalid) continue;

      console.log("📩 EVENT:", e);

      if (!e.tempId) {
        console.warn("⚠️ Missing tempId, skipping event:", e);
        continue;
      }

      ops.push({
        updateOne: {
          filter: { tempId: e.tempId }, // 👈 dedupe key
          upsert: true,

          update: {
            $setOnInsert: {
              chatId: e.roomId,
              senderId: e.senderId,
              chatModel: "DirectChat",
              type: e.messageType || "text",
              text: e.content,
              media: e.attachments || [],
              tempId: e.tempId,
              createdAt: new Date(e.timestamp),
              status: "sent"
            }
          }
        }
      });
    }

    console.log("⚙️ Bulk ops prepared:", ops.length);

    if (!ops.length) {
      console.warn("⚠️ No valid operations");
      return;
    }

    console.log("🚀 Executing bulkWrite with dedupe...");

    const result = await Message.bulkWrite(ops, { ordered: false });

    console.log("✅ bulkWrite success");
    console.log("📦 Inserted:", result.insertedCount);
    console.log("🔁 Modified:", result.modifiedCount);
    console.log("🔍 Matched:", result.matchedCount);
    console.log("🆔 Upserted:", result.upsertedCount);

  } catch (err) {
    console.error("❌ bulkWrite failed:", err);

    if (err.writeErrors) {
      console.error("🧨 writeErrors:", err.writeErrors);
    }
  }
}