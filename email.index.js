import "./env.js"
import connectDB from "./config/db.js";
import "./modules/email/email.worker.js";
import "./config/redis.js"
import { EMAIL_CONFIG } from "./config/email.config.js";

const start = async () => {
  await connectDB();
  console.log("Email started");
};

start();