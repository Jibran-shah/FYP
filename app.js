import "./env.js";
import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import "./config/redis.js";
import {errorHandler} from "./middlewares/errorHandler.middleware.js"
import authRoutes from "./modules/auth/auth.routes.js"
import path from "path"
import mediaFileRoutes from "./modules/media/files/files.routes.js"
import mediaAssetRoutes from "./modules/media/assets/assets.routes.js"
import basePorfileRoutes from "./modules/profiles/baseProfile/baseProfile.routes.js"
import sellerProfileRoutes from "./modules/profiles/seller/seller.routes.js"
import providerProfileRoutes from "./modules/profiles/provider/provider.routes.js"
import { requestIdMiddleware } from "./middlewares/requestId.middleware.js";
import { httpLogger } from "./middlewares/httpLogger.middleware.js";
import {logger} from "./config/logger.js";
import { globalRateLimiter } from "./rateLimitors.js";

const app = express();
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.use(globalRateLimiter)
    app.use(express.json());
    app.use(cookieParser());
    app.use(requestIdMiddleware);
    app.use(httpLogger);
    app.use(
      "/uploads",
      express.static(path.join(process.cwd(), "uploads"))
    );
    app.use("/api/auth",authRoutes);
    app.use("/api/media/files",mediaFileRoutes);
    app.use("/api/media/assets",mediaAssetRoutes);
    app.use("/api/profile/base",basePorfileRoutes);
    app.use("/api/profile/seller",sellerProfileRoutes)
    app.use("/api/profile/provider",providerProfileRoutes)
    app.get("/", (req, res) => {
      res.send("API Running");
    });
    app.use(errorHandler);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

startServer()

