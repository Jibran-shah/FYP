import { Message } from "../../../models/Message.model.js";

export async function messageDeliveredConsumer(events) {
  try {
    const ops = [];

    for (const e of events) {
      if (!e?.messageId || !e?.userId) continue;

      ops.push({
        updateOne: {
          filter: {
            _id: e.messageId,
            "delivery.userId": { $ne: e.userId }
          },
          update: {
            $set: {
              status: "delivered",
              deliveredAt: new Date(e.timestamp)
            },
            $addToSet: {
              delivery: {
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
    console.error("messageDeliveredConsumer failed:", err);
  }
}