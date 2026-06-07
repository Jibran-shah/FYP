import mongoose from "mongoose";
import { WalletTransaction } from "../../../models/WalletTransaction.model.js";
import { Wallet } from "../../../models/Wallet.mode.js";
import { BadRequestError, NotFoundError } from "../../../errors/Http.error.js";

/* =========================
   GET OR CREATE WALLET (SAFE UTILITY ONLY)
   NOTE: NO BUSINESS LOGIC, JUST ENSURE WALLET EXISTS
========================= */
const getOrCreateWallet = async (userId, session = null) => {
  let wallet = await Wallet.findOne({ userId }).session(session);

  if (!wallet) {
    const created = await Wallet.create([{ userId }], { session });
    wallet = created[0];
  }

  return wallet;
};

/* =========================
   CREATE WALLET TRANSACTION (SYSTEM / ADMIN)
   ONLY LOGS LEDGER ENTRY
========================= */
export const createWalletTransaction = async ({
  userId,
  amount,
  type,
  referenceModel,
  referenceId,
  meta
}) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const wallet = await getOrCreateWallet(userId, session);

    if (!amount || amount <= 0) {
      throw new BadRequestError("Invalid amount");
    }

    const tx = await WalletTransaction.create(
      [
        {
          wallet: wallet._id,
          userId,
          amount,
          type,
          referenceModel,
          referenceId,
          meta: meta || {},
          status: "completed"
        }
      ],
      { session }
    );

    await session.commitTransaction();
    return tx[0];
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/* =========================
   GET WALLET TRANSACTIONS
========================= */
export const getMyWalletTransactions = async ({
  userId,
  type,
  status,
  page = 1,
  limit = 10
}) => {
  const query = { userId };

  if (type) query.type = type;
  if (status) query.status = status;

  return WalletTransaction.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
};

/* =========================
   GET SINGLE TRANSACTION
========================= */
export const getWalletTransactionById = async ({
  transactionId,
  userId
}) => {
  const tx = await WalletTransaction.findById(transactionId);

  if (!tx) {
    throw new NotFoundError("Transaction not found");
  }

  if (tx.userId.toString() !== userId.toString()) {
    throw new BadRequestError("Not allowed");
  }

  return tx;
};