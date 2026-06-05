import { Message } from "../../../models/Message.model.js";

export async function messageReadConsumer(events) {
  try {
    const ops = [];

    for (const e of events) {
      if (!e?.messageId || !e?.userId) continue;

      ops.push({
        updateOne: {
          filter: {
            _id: e.messageId,
            "read.userId": { $ne: e.userId }
          },
          update: {
            $set: {
              status: "read",
              readAt: new Date(e.timestamp)
            },
            $addToSet: {
              read: {
                userId: e.userId,
                at: new Date(e.timestamp)
              }
            }
          }
        }
      });
    }

    if (!ops.length) return;

    await Message.bulkWrite(ops, { ordered: false });

  } catch (err) {
    console.error("messageReadConsumer failed:", err);
  }
}