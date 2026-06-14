import "./env.js";

import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import connectDB from "./config/db.js";
import "./config/redis.js";

import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { requestIdMiddleware } from "./middlewares/requestId.middleware.js";
import { httpLogger } from "./middlewares/httpLogger.middleware.js";
import { logger } from "./config/logger.js";
import { globalRateLimiter } from "./rateLimitors.js";
import { BASE_ROOT } from "./constants/app.constants.js";

// ================= ROUTES =================
import authRoutes from "./modules/auth/auth.routes.js";

import mediaFileRoutes from "./modules/media/files/files.routes.js";
import mediaAssetRoutes from "./modules/media/assets/assets.routes.js";

import baseProfileRoutes from "./modules/profiles/baseProfile/baseProfile.routes.js";
import sellerProfileRoutes from "./modules/profiles/seller/seller.routes.js";
import providerProfileRoutes from "./modules/profiles/provider/provider.routes.js";

import categoryRoutes from "./modules/categories/categories.routes.js";
import productRoutes from "./modules/products/products.routes.js";
import serviceRoutes from "./modules/services/services.routes.js";

import reviewRoutes from "./modules/reviews/reviews.routes.js";

import directChatRoutes from "./modules/chat/directChat/directChat.routes.js";
import groupChatRoutes from "./modules/chat/groupChats/groupChats.routes.js";
import messagesRoutes from "./modules/chat/messages/messages.routes.js";

import sellerOrderRoutes from "./modules/orders/sellerOrders/sellerOrders.routes.js";
import buyerOrderRoutes from "./modules/orders/buyerOrders/buyerOrders.routes.js";
import checkoutRoutes from "./modules/orders/checkout/checkout.routes.js";
import cartRoutes from "./modules/orders/cart/cart.routes.js";
import paymentRoutes from "./modules/payment/payments.routes.js";

import walletRoutes from "./modules/accountFunds/wallet/wallet.routes.js";
import walletTransactionRoutes from "./modules/accountFunds/walletTransactions/walletTransactions.routes.js";
import withdrawRequestRoutes from "./modules/accountFunds/withdrawRequests/withdrawRequests.routes.js";

import bookingRoutes from "./modules/bookings/bookings.routes.js";

// ================= APP =================
const app = express();
const PORT = process.env.PORT || 5000;


app.use(
      cors({
        origin: ["http://localhost:5173"],
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    // Explicit preflight handling
app.options(/.*/, cors());

// ================= START SERVER =================
const startServer = async () => {
  try {
    await connectDB();

    // =====================================================
    // 2. GLOBAL MIDDLEWARES
    // =====================================================
    app.use(express.json());
    app.use(cookieParser());

    app.use(requestIdMiddleware);
    app.use(httpLogger);

    // Rate limiter AFTER CORS (IMPORTANT FIX)
    app.use(globalRateLimiter);

    // =====================================================
    // 3. STATIC FILES
    // =====================================================
    app.use(
      "/uploads",
      express.static(path.join(process.cwd(), "uploads"))
    );

    // =====================================================
    // 4. ROUTES
    // =====================================================
    app.use(BASE_ROOT + "/auth", authRoutes);

    app.use(BASE_ROOT + "/products", productRoutes);
    app.use(BASE_ROOT + "/services", serviceRoutes);

    app.use(BASE_ROOT + "/buyerOrders", buyerOrderRoutes);
    app.use(BASE_ROOT + "/sellerOrders", sellerOrderRoutes);
    app.use(BASE_ROOT + "/checkout", checkoutRoutes);
    app.use(BASE_ROOT + "/cart", cartRoutes);
    app.use(BASE_ROOT + "/payments", paymentRoutes);

    app.use(BASE_ROOT + "/bookings", bookingRoutes);

    app.use(BASE_ROOT + "/wallet", walletRoutes);
    app.use(BASE_ROOT + "/walletTransactions", walletTransactionRoutes);
    app.use(BASE_ROOT + "/WithdrawRequests", withdrawRequestRoutes);

    app.use(BASE_ROOT + "/chat/direct", directChatRoutes);
    app.use(BASE_ROOT + "/chat/group", groupChatRoutes);
    app.use(BASE_ROOT + "/messages", messagesRoutes);

    app.use(BASE_ROOT + "/categories", categoryRoutes);

    app.use(BASE_ROOT + "/media/files", mediaFileRoutes);
    app.use(BASE_ROOT + "/media/assets", mediaAssetRoutes);

    app.use(BASE_ROOT + "/profiles/buyers", baseProfileRoutes);
    app.use(BASE_ROOT + "/profiles/sellers", sellerProfileRoutes);
    app.use(BASE_ROOT + "/profiles/providers", providerProfileRoutes);

    app.use(BASE_ROOT + "/reviews", reviewRoutes);

    // =====================================================
    // HEALTH CHECK
    // =====================================================
    app.get("/", (req, res) => {
      res.send("API Running");
    });

    // =====================================================
    // ERROR HANDLER (LAST)
    // =====================================================
    app.use(errorHandler);

  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

startServer();

export default app;