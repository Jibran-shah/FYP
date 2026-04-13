import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import "./modules/email/email.worker.js"; // just import to start worker

const start = async () => {
  await connectDB();
  console.log("🚀 Worker started");
};

start();