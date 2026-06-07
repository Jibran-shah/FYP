import mongoose from "mongoose";

import { v4 as uuidv4 } from "uuid";

import { BuyerOrder } from "../../models/BuyerOrder.model.js";
import { PaymentTransaction } from "../../models/PaymentTransaction.model.js";
import { Booking } from "../../models/Booking.model.js";
import { SellerOrder } from "../../models/SellerOrder.model.js";
import { WalletTransaction } from "../../models/WalletTransaction.model.js";

import { createSellerOrdersFromBuyerOrder } from "../orders/sellerOrders/sellerOrders.service.js";
import { getOrCreateWallet } from "../accountFunds/wallet/wallet.service.js";
import ProductSeller from "../../models/ProductSeller.model.js";
import { MODELS } from "../../constants/models.constants.js";
import { WALLET_TRANSACTION_STATUS, WALLET_TRANSACTION_TYPE } from "../../constants/wallet.constants.js";
import { BOOKING_STATUS } from "../../constants/booking.constants.js";
import { PAYABLE_TYPE } from "../../constants/payment.constants.js";
import { logger } from "../../config/logger.js";
import { BUYER_ORDER_STATUS } from "../../constants/order.constants.js";
import { ServiceProvider } from "../../models/ServiceProvider.model.js";


/* =========================================================
   CREATE PAYMENT TRANSACTION (MANUAL / CART / ORDER INIT)
========================================================= */
export const createPaymentTransaction = async ({
  buyerId,
  amount,
  payableType,
  payableId,
  provider,
  idempotencyKey
}) => {
  const existing = idempotencyKey
    ? await PaymentTransaction.findOne({
        buyer: buyerId,
        idempotencyKey
      })
    : null;

  if (existing) return existing;

  const transaction = await PaymentTransaction.create({
    buyer: buyerId,
    amount,
    provider,
    payableType,
    payableId,
    status: "pending",
    transactionId: uuidv4(),
    idempotencyKey: idempotencyKey || null
  });

  return transaction;
};

/* =========================================================
   GET MY PAYMENT TRANSACTIONS
========================================================= */
export const getMyPaymentTransactions = async ({
  buyerId,
  page = 1,
  limit = 20
}) => {
  page = Math.max(Number(page), 1);
  limit = Math.min(Math.max(Number(limit), 1), 100);

  const [data, total] = await Promise.all([
    PaymentTransaction.find({ buyer: buyerId })
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit),

    PaymentTransaction.countDocuments({ buyer: buyerId })
  ]);

  return {
    data,
    meta: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    }
  };
};

/* =========================================================
   GET SINGLE PAYMENT TRANSACTION
========================================================= */
export const getPaymentTransactionById = async ({
  transactionId,
  buyerId
}) => {
  const transaction = await PaymentTransaction.findOne({
    _id: transactionId,
    buyer: buyerId
  });

  if (!transaction) {
    throw new Error("Payment transaction not found");
  }

  return transaction;
};



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
  if (transaction.payableType === PAYABLE_TYPE.ORDER) {
    const buyerOrder = await BuyerOrder.findById(
      transaction.payableId
    ).session(session);

    if (!buyerOrder) {
      throw new Error("Buyer order not found");
    }

    // already processed guard
    if (buyerOrder.status === BUYER_ORDER_STATUS.PAID) return;

    buyerOrder.status = BUYER_ORDER_STATUS.PAID;
    await buyerOrder.save({ session });

    // ================================
    // FIX 1: ALWAYS CREATE SELLER ORDERS HERE
    // ================================
    const sellerOrders = await createSellerOrdersFromBuyerOrder({
      buyerOrder,
      paymentTransaction: transaction._id,
      session
    });

    buyerOrder.sellerOrders = sellerOrders.map((o) => o._id);
    await buyerOrder.save({ session });

    // ================================
    // FIX 2: WALLET DISTRIBUTION SAFE
    // ================================
    for (const sellerOrder of sellerOrders) {

      const sellerId = sellerOrder.seller?.toString();

      const seller = await ProductSeller.findById(sellerId).session(session);

      if (!seller) continue;

      const sellerUserId = seller.user;

      const existingTxn = await WalletTransaction.findOne({
        referenceModel: MODELS.SELLER_ORDER,
        referenceId: sellerOrder._id
      }).session(session);

      if (existingTxn) continue;

      const wallet = await getOrCreateWallet(
        sellerUserId,
        session
      );

      wallet.pendingBalance =
        (wallet.pendingBalance || 0) +
        (sellerOrder.totalAmount || 0);

      await wallet.save({ session });

      await WalletTransaction.create(
        [
          {
            wallet: wallet._id,
            userId: sellerUserId,
            type: WALLET_TRANSACTION_TYPE.ORDER_EARNING,
            amount: sellerOrder.totalAmount || 0,
            referenceModel: MODELS.SELLER_ORDER,
            referenceId: sellerOrder._id,
            status: WALLET_TRANSACTION_STATUS.PENDING
          }
        ],
        { session }
      );
    }
  } 

  else if (transaction.payableType === PAYABLE_TYPE.BOOKING) {
    const booking = await Booking.findById(
      transaction.payableId
    ).session(session);

    if (!booking) return;

    if (booking.status === BOOKING_STATUS.CONFIRMED) return;

    booking.status = BOOKING_STATUS.CONFIRMED;
    await booking.save({ session });

    const provider = await ServiceProvider.findById(
      booking.serviceProvider
    ).session(session);

    if (!provider) {
      throw new Error("Service provider not found");
    }

    const providerUserId = provider.user;

    const existingTxn = await WalletTransaction.findOne({
      referenceModel: MODELS.BOOKING,
      referenceId: booking._id
    }).session(session);

    if (existingTxn) return;

    const wallet = await getOrCreateWallet(
      providerUserId,
      session
    );

    wallet.pendingBalance =
      (wallet.pendingBalance || 0) +
      (booking.price || 0);

    await wallet.save({ session });

    await WalletTransaction.create(
      [
        {
          wallet: wallet._id,
          userId: providerUserId,
          type: WALLET_TRANSACTION_TYPE.BOOKING_EARNING,
          amount: booking.price || 0,
          referenceModel: MODELS.BOOKING,
          referenceId: booking._id,
          status: WALLET_TRANSACTION_STATUS.PENDING
        }
      ],
      { session }
    );
  }
  else{
    logger.error("invalid payable type");
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