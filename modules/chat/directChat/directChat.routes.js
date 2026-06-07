import express from "express";

import {
  createDirectChat,
  getDirectChat,
  getUserDirectChats,
  deleteDirectChatForUser,
  blockDirectChatUser,
  unBlockDirectChatUser
} from "./directChat.controller.js";

import {
  createDirectChatSchema,
  paramsChatIdSchema,
  paramsUserIdSchema,
  bodyUserIdSchema,
  bodyBlockerIdSchema
} from "./directChat.validation.js";

import {validate} from "../../../middlewares/validate.middleware.js";
import { protect } from "../../../middlewares/protect.middleware.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const router = express.Router();

router.use(protect({requireBaseProfile:true}));

/* =========================
   CREATE DIRECT CHAT
========================= */
router.post(
    "/",
    validate(createDirectChatSchema, "body"),
    asyncHandler(createDirectChat)
);


/* =========================
   GET ALL DIRECT CHATS OF USER
========================= */
router.get(
  "/user",
  asyncHandler(getUserDirectChats)
);

/* =========================
   GET SINGLE DIRECT CHAT
========================= */
router.get(
  "/:chatId",
  validate(paramsChatIdSchema, "params"),
  asyncHandler(getDirectChat)
);



/* =========================
   DELETE CHAT FOR USER (SOFT DELETE)
========================= */
router.patch(
  "/:chatId/delete",
  validate(paramsChatIdSchema, "params"),
  asyncHandler(deleteDirectChatForUser)
);


/* =========================
   BLOCK USER IN DIRECT CHAT
========================= */
router.patch(
  "/:chatId/block",
  validate(paramsChatIdSchema, "params"),
  asyncHandler(blockDirectChatUser)
);


router.patch(
  "/:chatId/unblock",
  validate(paramsChatIdSchema, "params"),
  asyncHandler(unBlockDirectChatUser)
);

export default router;