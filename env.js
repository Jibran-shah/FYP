import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { InternalServerError } from "./errors/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 adjust based on your structure
const envPath = path.resolve(__dirname, ".env");

const result = dotenv.config({ path: envPath });

if (result.error) {
  throw new InternalServerError(`❌ Failed to load .env from ${envPath}`);
}

console.log("✅ ENV loaded from:", envPath);