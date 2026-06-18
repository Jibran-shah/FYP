import {redis} from "../config/redis.js";
import PushSubscription from "../models/PushSubscription.model.js"

const CACHE_TTL = 60 * 60 * 24; // 24 hours

export const getPushSubscription = async (userId) => {
  const key = `push-subscription:${userId}`;

  // 1. Check Redis
  const cached = await redis.get(key);

  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Query MongoDB
  const subscription = await PushSubscription.findOne({
    user: userId,
  }).lean();

  if (!subscription) {
    return null;
  }

  // 3. Store in Redis
  await redis.setEx(
    key,
    CACHE_TTL,
    JSON.stringify(subscription)
  );

  return subscription;
};

export const invalidatePushSubscriptionCache = async (
  userId
) => {
  await redis.del(`push-subscription:${userId}`);
};