import { Message } from "../../../models/Message.model.js";

export async function messageConsumer(events) {
  try {
    const ops = [];

    for (const e of events) {
      if (e?.__invalid) continue;

      ops.push({
        updateOne: {
          filter: { tempId: e.tempId },
          update: {
            $setOnInsert: {
              chatId: e.roomId,
              senderId: e.senderId,
              type: e.messageType || "text",
              content: e.content,
              attachments: e.attachments || [],
              tempId: e.tempId,
              createdAt: new Date(e.timestamp),
              status: "sent"
            }
          },
          upsert: true
        }
      });
    }

    if (!ops.length) return;

    await Message.bulkWrite(ops, { ordered: false });

  } catch (err) {
    if (err.writeErrors) {
      console.log(err.writeErrors);
    }
  }
}