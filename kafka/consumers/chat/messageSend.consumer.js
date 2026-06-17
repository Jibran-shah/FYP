import { Message } from "../../../models/Message.model.js";
import { DirectChat } from "../../../models/DirectChat.model.js";

export async function messageSendConsumer(events) {
  console.log("📥 [MESSAGE_CONSUMER] Batch received");
  console.log("📊 Total events:", events.length);

  try {
    const ops = [];

    for (const e of events) {
      if (!e || e.__invalid) continue;

      console.log("📩 EVENT:", e);

      if (!e.tempId) {
        console.warn("⚠️ Missing tempId, skipping:", e);
        continue;
      }

      const timestamp = e.timestamp
        ? new Date(e.timestamp)
        : new Date();

      ops.push({
        updateOne: {
          filter: {
            tempId: e.tempId,
          },

          upsert: true,

          update: {
            // Always update mutable fields
            $set: {
              chatId: e.chatId,
              senderId: e.senderId,
              text: e.text,
              media: e.attachments || [],
              type: e.messageType || "text",
              updatedAt: new Date(),
            },

            // Only on first insert
            $setOnInsert: {
              tempId: e.tempId,
              chatModel: e.chatModel || "DirectChat",
              createdAt: timestamp,
              status: "sent",
            },
          },
        },
      });
    }

    console.log("⚙️ Bulk ops prepared:", ops.length);

    if (!ops.length) {
      console.warn("⚠️ No valid operations");
      return;
    }

    /* =========================
       SAVE MESSAGES
    ========================= */

    const result = await Message.bulkWrite(ops, {
      ordered: false,
    });

    console.log("✅ bulkWrite success");
    console.log("📦 Inserted:", result.insertedCount);
    console.log("🔁 Modified:", result.modifiedCount);
    console.log("🔍 Matched:", result.matchedCount);
    console.log("🆔 Upserted:", result.upsertedCount);

    /* =========================
       UPDATE DIRECT CHAT
       LAST MESSAGE
    ========================= */

    const tempIds = ops.map(
      (op) => op.updateOne.update.$setOnInsert.tempId
    );

    const savedMessages = await Message.find({
      tempId: { $in: tempIds },
    })
      .select(
        "_id chatId senderId text createdAt chatModel"
      )
      .lean();

    // Keep only latest message per chat
    const latestPerChat = new Map();

    for (const msg of savedMessages) {
      if (msg.chatModel !== "DirectChat") continue;

      const chatId = String(msg.chatId);

      const existing = latestPerChat.get(chatId);

      if (
        !existing ||
        new Date(msg.createdAt) >
          new Date(existing.createdAt)
      ) {
        latestPerChat.set(chatId, msg);
      }
    }

    const chatOps = [...latestPerChat.values()].map(
      (msg) => ({
        updateOne: {
          filter: {
            _id: msg.chatId,
          },

          update: {
            $set: {
              lastMessage: {
                messageId: msg._id,
                senderId: msg.senderId,
                content: msg.text || "",
                updatedAt: msg.createdAt,
              },
            },
          },
        },
      })
    );

    if (chatOps.length) {
      const chatResult = await DirectChat.bulkWrite(
        chatOps,
        {
          ordered: false,
        }
      );

      console.log(
        `💬 Updated lastMessage for ${chatOps.length} chats`
      );

      console.log("📊 Chat update result:", {
        matched: chatResult.matchedCount,
        modified: chatResult.modifiedCount,
      });
    }
  } catch (err) {
    console.error("❌ bulkWrite failed:", err);

    if (err.writeErrors) {
      console.error(
        "🧨 writeErrors:",
        err.writeErrors
      );
    }
  }
}