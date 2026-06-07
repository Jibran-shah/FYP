import mongoose from "mongoose";
import { Wallet } from "../../../models/Wallet.mode.js";
import { WalletTransaction } from "../../../models/WalletTransaction.model.js";
import { WALLET_TRANSACTION_TYPE } from "../../../constants/wallet.constants.js";

/* =========================
   GET OR CREATE WALLET
========================= */
export const getOrCreateWallet = async (
  userId,
  session = null
) => {
  return Wallet.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        availableBalance: 0,
        pendingBalance: 0
      }
    },
    {
      upsert: true,
      new: true,
      session
    }
  );
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

    const wallet = await getOrCreateWallet(userId,session);

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    console.log(wallet);

    console.log(amount);
    console.log(wallet.pendingBalance)

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
          type: WALLET_TRANSACTION_TYPE.RELEASE,
          amount,
          referenceId,
          referenceModel,
          status: "completed"
        }
      ],
      { session }
    );

    console.log(wallet);

    await session.commitTransaction();
    return wallet;

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};