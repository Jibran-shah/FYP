import mongoose from "mongoose";
import { Wallet } from "../../../models/Wallet.mode.js";
import { WalletTransaction } from "../../../models/WalletTransaction.model.js";

/* =========================
   GET OR CREATE WALLET
========================= */
const getOrCreateWallet = async (userId, session = null) => {
  let wallet = await Wallet.findOne({ userId }).session(session);

  if (!wallet) {
    const created = await Wallet.create(
      [
        {
          userId,
          availableBalance: 0,
          pendingBalance: 0
        }
      ],
      { session }
    );

    wallet = created[0];
  }

  return wallet;
};

/* =========================
   GET MY WALLET
========================= */
export const getMyWallet = async ({ userId }) => {
  return await getOrCreateWallet(userId);
};

/* =========================
   RELEASE WALLET EARNING (ESCROW FINALIZATION)
========================= */
export const releaseWalletEarning = async ({
  userId,
  amount,
  referenceId,
  referenceModel
}) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    const wallet = await Wallet.findOne({ userId }).session(session);

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    if (wallet.pendingBalance < amount) {
      throw new Error("Insufficient pending balance");
    }

    // ESCROW MOVE: pending → available
    wallet.pendingBalance -= amount;
    wallet.availableBalance += amount;

    await wallet.save({ session });

    await WalletTransaction.create(
      [
        {
          wallet: wallet._id,
          userId,
          type: "release",
          amount,
          referenceId,
          referenceModel,
          status: "completed"
        }
      ],
      { session }
    );

    await session.commitTransaction();
    return wallet;

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};