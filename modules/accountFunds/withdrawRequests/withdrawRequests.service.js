import mongoose from "mongoose";

import { WithdrawRequest } from "../../../models/WithdrawRequest.model.js";
import { Wallet } from "../../../models/Wallet.mode.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../../errors/Http.error.js";

/* =========================
   GET OR CREATE WALLET (internal)
========================= */
const getWallet = async (userId, session = null) => {
  let wallet = await Wallet.findOne({ userId }).session(session);

  if (!wallet) {
    wallet = await Wallet.create([{ userId }], { session });
    wallet = wallet[0];
  }

  return wallet;
};

/* =========================
   CREATE WITHDRAW REQUEST
========================= */
export const createWithdrawRequest = async ({
  userId,
  amount,
  proofMediaId
}) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const wallet = await getWallet(userId, session);

    if (wallet.availableBalance < amount) {
      throw new BadRequestError("Insufficient balance");
    }

    // lock funds
    wallet.availableBalance -= amount;
    wallet.pendingBalance += amount;
    await wallet.save({ session });

    const request = await WithdrawRequest.create(
      [
        {
          userId,
          wallet: wallet._id,
          amount,
          proofMediaId: proofMediaId || null,
          status: "pending"
        }
      ],
      { session }
    );

    await session.commitTransaction();

    return request[0];
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/* =========================
   GET MY REQUESTS
========================= */
export const getMyWithdrawRequests = async ({
  userId,
  status,
  page = 1,
  limit = 10
}) => {
  const query = { userId };

  if (status) query.status = status;

  return WithdrawRequest.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
};

/* =========================
   GET BY ID
========================= */
export const getWithdrawRequestById = async ({
  withdrawRequestId,
  userId
}) => {
  const request = await WithdrawRequest.findById(withdrawRequestId);

  if (!request) {
    throw new NotFoundError("Withdraw request not found");
  }

  if (request.userId.toString() !== userId.toString()) {
    throw new ForbiddenError("Not allowed");
  }

  return request;
};

/* =========================
   ADMIN UPDATE STATUS
========================= */
export const updateWithdrawRequestStatus = async ({
  withdrawRequestId,
  status,
  adminNote
}) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const request = await WithdrawRequest.findById(withdrawRequestId).session(session);

    if (!request) {
      throw new NotFoundError("Withdraw request not found");
    }

    const wallet = await Wallet.findById(request.wallet).session(session);

    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }

    /* =========================
       APPROVED → finalize pending deduction
    ========================= */
    if (status === "approved") {
      wallet.pendingBalance -= request.amount;
    }

    /* =========================
       REJECTED → refund to available
    ========================= */
    if (status === "rejected") {
      wallet.pendingBalance -= request.amount;
      wallet.availableBalance += request.amount;
    }

    await wallet.save({ session });

    request.status = status;
    request.adminNote = adminNote || "";
    await request.save({ session });

    await session.commitTransaction();

    return request;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};