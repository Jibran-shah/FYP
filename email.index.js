import "./env.js"
import connectDB from "./config/db.js";
import "./modules/email/email.worker.js"; // just import to start worker
import "./config/redis.js"
import { EMAIL_CONFIG } from "./config/email.config.js";

const start = async () => {
  await connectDB();
  console.log("email server started");
  console.log("SMTP CONFIG:", EMAIL_CONFIG.SMTP);
};

start();