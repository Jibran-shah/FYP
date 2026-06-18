import webpush from "../config/push.config.js";
import PushSubscription from "../models/PushSubscription.model.js";
import { getPushSubscription } from "./getPushSubscription.js";
import {getIO} from "../realtime/socket.js"
import {presenceStore} from "../realtime/utils/presence.store.js";
import crypto from "crypto";

export const notifyUser = async ({
  userId,
  title,
  message,
  url = "/",
  type = "success",
  data = {},
}) => {
  const io = getIO();
  const isOnline = presenceStore.isOnline(userId);

  const payload = {
    id: crypto.randomUUID(),
    title,
    message,
    url,
    type,
    data,
    createdAt: new Date().toISOString(),
  };

  try {
    if (isOnline) {
      io.to(`user:${userId}`).emit("notification", payload);
      return { deliveredVia: "socket" };
    }

    const sub = await getPushSubscription(userId);

    if (!sub) {
      return {
        deliveredVia: "none",
        reason: "no_subscription",
      };
    }

    await webpush.sendNotification(
      sub.subscription,
      JSON.stringify(payload)
    );

    return { deliveredVia: "push" };
  } catch (err) {
    console.error("notifyUser error:", err);
    if ((err.statusCode === 404 || err.statusCode === 410)) {
      await PushSubscription.deleteOne({
        _id: sub?._id,
      });
    }
    throw err;
  }
};