import mongoose from "mongoose";
import { MODELS } from "../constants/models.constants";

const logSchema = new mongoose.Schema({
  level: String,
  message: String,
  meta: Object,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model(MODELS.LOG, logSchema);