import { Router } from "express";

import * as walletController from "./wallet.controller.js";
import { protect } from "../../../middlewares/protect.middleware.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const router = Router();

/* =========================
   GET MY WALLET (STATE ONLY)
========================= */
router.get(
  "/me",
  protect(),
  asyncHandler(walletController.getMyWallet)
);

export default router;