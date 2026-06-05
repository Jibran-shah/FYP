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
import categoryRoutes from "./modules/categories/categories.routes.js"
import productRoutes from "./modules/products/products.routes.js"
import serviceRoutes from "./modules/services/services.routes.js"
import reviewRoutes from "./modules/reviews/reviews.routes.js"
import { requestIdMiddleware } from "./middlewares/requestId.middleware.js";
import { httpLogger } from "./middlewares/httpLogger.middleware.js";
import {logger} from "./config/logger.js";
import { globalRateLimiter } from "./rateLimitors.js";
import { EMAIL_CONFIG } from "./config/email.config.js";
import { BASE_ROOT } from "./constants/app.constants.js";

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
    app.use(BASE_ROOT+"/auth",authRoutes);
    app.use(BASE_ROOT+"/products",productRoutes)
    app.use(BASE_ROOT+"/services",serviceRoutes)
    app.use(BASE_ROOT+"/categories",categoryRoutes)
    app.use(BASE_ROOT+"/media/files",mediaFileRoutes);
    app.use(BASE_ROOT+"/media/assets",mediaAssetRoutes);
    app.use(BASE_ROOT+"/profiles/buyers",basePorfileRoutes);
    app.use(BASE_ROOT+"/profiles/sellers",sellerProfileRoutes);
    app.use(BASE_ROOT+"/profiles/providers",providerProfileRoutes);
    app.use(BASE_ROOT+"/reviews",reviewRoutes);
    app.get("/", (req, res) => {
      res.send("API Running");
    });
    app.use(errorHandler);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

startServer()

export default app;

