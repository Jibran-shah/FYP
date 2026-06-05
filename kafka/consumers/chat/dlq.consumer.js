
export async function dlqConsumer(events) {
  try {
    for (const e of events) {
      console.error("DLQ:", {
        reason: e.reason || "unknown",
        payload: e
      });
    }
  } catch (err) {
    console.error("DLQ consumer error:", err);
  }
}