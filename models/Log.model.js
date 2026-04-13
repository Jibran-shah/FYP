import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  level: String,
  message: String,
  meta: Object,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Log", logSchema);