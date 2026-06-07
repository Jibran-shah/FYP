import mongoose from "mongoose";

import { BuyerOrder } from "../../models/BuyerOrder.model.js";
import { PaymentTransaction } from "../../models/PaymentTransaction.model.js";
import { Booking } from "../../models/Booking.model.js";
import { SellerOrder } from "../../models/SellerOrder.model.js";
import { Wallet } from "../../models/Wallet.mode.js";
import { WalletTransaction } from "../../models/WalletTransaction.model.js";

import { createSellerOrdersFromBuyerOrder } from "../orders/sellerOrders/sellerOrders.service.js";

/* =========================================================
   MAIN WEBHOOK ENTRY
========================================================= */
export const handlePaymentWebhook = async ({
  gatewayTransactionId,
  status
}) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const transaction = await PaymentTransaction.findOne({
      transactionId: gatewayTransactionId
    }).session(session);

    if (!transaction) {
      throw new Error("Payment transaction not found");
    }

    // normalize status
    const newStatus = status.toLowerCase();

    // HARD IDEMPOTENCY GUARD
    if (transaction.status === newStatus) {
      await session.commitTransaction();
      return transaction;
    }

    transaction.status = newStatus;
    await transaction.save({ session });

    if (newStatus === "success") {
      await handleSuccess(transaction, session);
    }

    if (newStatus === "failed") {
      await handleFailed(transaction, session);
    }

    if (newStatus === "refunded") {
      await handleRefund(transaction, session);
    }

    await session.commitTransaction();
    return transaction;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/* =========================================================
   SUCCESS FLOW (ESCROW RELEASE)
========================================================= */
const handleSuccess = async (transaction, session) => {
  if (transaction.payableType === "order") {
    const buyerOrder = await BuyerOrder.findById(
      transaction.payableId
    ).session(session);

    if (!buyerOrder) {
      throw new Error("Buyer order not found");
    }

    // already processed guard
    if (buyerOrder.status === "paid") return;

    buyerOrder.status = "paid";
    await buyerOrder.save({ session });

    // ================================
    // FIX 1: ALWAYS CREATE SELLER ORDERS HERE
    // ================================
    const sellerOrders = await createSellerOrdersFromBuyerOrder({
      buyerOrder,
      session
    });

    buyerOrder.sellerOrders = sellerOrders.map((o) => o._id);
    await buyerOrder.save({ session });

    // ================================
    // FIX 2: WALLET DISTRIBUTION SAFE
    // ================================
    for (const sellerOrder of sellerOrders) {
      const sellerId = sellerOrder.seller?.toString();
      if (!sellerId) continue;

      // prevent double credit
      const existingTxn = await WalletTransaction.findOne({
        referenceModel: "SellerOrder",
        referenceId: sellerOrder._id
      }).session(session);

      if (existingTxn) continue;

      let wallet = await Wallet.findOne({
        userId: sellerId
      }).session(session);

      if (!wallet) {
        const created = await Wallet.create(
          [{ userId: sellerId, pendingBalance: 0 }],
          { session }
        );
        wallet = created[0];
      }

      wallet.pendingBalance += sellerOrder.totalAmount || 0;
      await wallet.save({ session });

      await WalletTransaction.create(
        [
          {
            wallet: wallet._id,
            userId: sellerId,
            type: "order_earning",
            amount: sellerOrder.totalAmount || 0,
            referenceModel: "SellerOrder",
            referenceId: sellerOrder._id,
            status: "pending"
          }
        ],
        { session }
      );
    }
  }

  /* =========================
     BOOKING SUCCESS
  ========================= */
  if (transaction.payableType === "booking") {
    const booking = await Booking.findById(
      transaction.payableId
    ).session(session);

    if (!booking) return;

    if (booking.status === "confirmed") return;

    booking.status = "confirmed";
    await booking.save({ session });

    const providerId = booking.serviceProvider?.toString();
    if (!providerId) return;

    const existingTxn = await WalletTransaction.findOne({
      referenceModel: "Booking",
      referenceId: booking._id
    }).session(session);

    if (existingTxn) return;

    let wallet = await Wallet.findOne({
      userId: providerId
    }).session(session);

    if (!wallet) {
      const created = await Wallet.create(
        [{ userId: providerId, pendingBalance: 0 }],
        { session }
      );
      wallet = created[0];
    }

    wallet.pendingBalance += booking.price || 0;
    await wallet.save({ session });

    await WalletTransaction.create(
      [
        {
          wallet: wallet._id,
          userId: providerId,
          type: "booking_earning",
          amount: booking.price || 0,
          referenceModel: "Booking",
          referenceId: booking._id,
          status: "pending"
        }
      ],
      { session }
    );
  }
};

/* =========================================================
   FAILED FLOW
========================================================= */
const handleFailed = async (transaction, session) => {
  if (transaction.payableType === "order") {
    const order = await BuyerOrder.findById(
      transaction.payableId
    ).session(session);

    if (!order) return;

    if (order.status === "failed") return;

    order.status = "failed";
    await order.save({ session });
  }

  if (transaction.payableType === "booking") {
    const booking = await Booking.findById(
      transaction.payableId
    ).session(session);

    if (!booking) return;

    if (booking.status === "failed") return;

    booking.status = "failed";
    await booking.save({ session });
  }
};

/* =========================================================
   REFUND FLOW
========================================================= */
const handleRefund = async (transaction, session) => {
  if (transaction.payableType === "order") {
    const order = await BuyerOrder.findById(
      transaction.payableId
    ).session(session);

    if (!order) return;

    if (order.status === "refunded") return;

    order.status = "refunded";
    await order.save({ session });

    // TODO: rollback wallet logic later
  }

  if (transaction.payableType === "booking") {
    const booking = await Booking.findById(
      transaction.payableId
    ).session(session);

    if (!booking) return;

    if (booking.status === "refunded") return;

    booking.status = "refunded";
    await booking.save({ session });

    // TODO: rollback wallet logic later
  }
};