import express from "express";
import PushSubscription from "./models/PushSubscription.js";

const router = express.Router();

router.post("/subscribe", async (req, res) => {
  const { userId, subscription } = req.body;

  await PushSubscription.findOneAndUpdate(
    { user: userId },
    { subscription },
    { upsert: true, new: true }
  );

  res.json({ success: true });
});

export default router;