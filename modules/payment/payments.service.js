import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

/* =========================
   MODELS
========================= */
import { BuyerOrder } from "../../models/BuyerOrder.model.js";
import { PaymentTransaction } from "../../models/PaymentTransaction.model.js";
import { Booking } from "../../models/Booking.model.js";
import ProductSeller from "../../models/ProductSeller.model.js";
import { ServiceProvider } from "../../models/ServiceProvider.model.js";
import { WalletTransaction } from "../../models/WalletTransaction.model.js";

/* =========================
   SERVICES
========================= */
import { createSellerOrdersFromBuyerOrder } from "../orders/sellerOrders/sellerOrders.service.js";
import { getOrCreateWallet } from "../accountFunds/wallet/wallet.service.js";

/* =========================
   CONSTANTS
========================= */
import {
  BUYER_ORDER_STATUS,
} from "../../constants/order.constants.js";

import {
  PAYMENT_STATUS,
  PAYABLE_TYPE,
} from "../../constants/payment.constants.js";

import {
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPE,
} from "../../constants/wallet.constants.js";

import {
  BOOKING_STATUS,
} from "../../constants/booking.constants.js";

import { MODELS } from "../../constants/models.constants.js";

import { logger } from "../../config/logger.js";

import { BadRequestError, InternalServerError } from "../../errors/Http.error.js";
import {processRefund, safepay} from "../../utils/payment.utils.js"

/* =========================================================
   CREATE PAYMENT TRANSACTION (INIT)
========================================================= */
export const createPaymentTransaction = async ({
  buyerId,
  amount,
  payableType,
  payableId,
  provider,
  idempotencyKey,
}) => {
  const existing = idempotencyKey
    ? await PaymentTransaction.findOne({
        buyer: buyerId,
        idempotencyKey,
      })
    : null;

  if (existing) return existing;

  return PaymentTransaction.create({
    buyer: buyerId,
    amount,
    provider,
    payableType,
    payableId,
    status: PAYMENT_STATUS.PENDING,
    transactionId: uuidv4(),
    idempotencyKey: idempotencyKey || null,
  });
};

/* =========================================================
   GET ALL TRANSACTIONS
========================================================= */
export const getMyPaymentTransactions = async ({
  buyerId,
  page = 1,
  limit = 20,
}) => {
  page = Math.max(Number(page), 1);
  limit = Math.min(Math.max(Number(limit), 1), 100);

  const [data, total] = await Promise.all([
    PaymentTransaction.find({ buyer: buyerId })
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit),

    PaymentTransaction.countDocuments({ buyer: buyerId }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  };
};

/* =========================================================
   GET SINGLE TRANSACTION
========================================================= */
export const getPaymentTransactionById = async ({
  transactionId,
  buyerId,
}) => {
  const transaction = await PaymentTransaction.findOne({
    _id: transactionId,
    buyer: buyerId,
  });

  if (!transaction) {
    throw new Error("Payment transaction not found");
  }

  return transaction;
};


/* =========================================================
   SAFEPEAY WEBHOOK ENTRY POINT
========================================================= */
export const safePayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-safepay-signature"];
    const secret = process.env.SAFEPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return res.status(400).json({ message: "Missing signature" });
    }

    const rawBody = JSON.stringify(req.body);

    // 🔐 VERIFY SIGNATURE (Safepay style HMAC)
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const payload = req.body;
    const data = payload?.data;

    if (!data) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const trackerToken = data?.tracker?.token;
    const state = data?.tracker?.state; // Safepay style

    let status = "pending";

    if (state === "TRACKER_ENDED" || state === "PAID") {
      status = "success";
    } else if (state === "FAILED" || state === "CANCELLED") {
      status = "failed";
    }

    await handlePaymentWebhook({
      trackerToken,
      status,
      raw: payload,
      paymentMethod: data?.payment_method,
    });

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ message: "Webhook failed" });
  }
};

/* =========================================================
   WEBHOOK ENTRY (SOURCE OF TRUTH)
========================================================= */
export const handlePaymentWebhook = async ({
  gatewayTransactionId,
  trackerToken,
  status,
  raw,
  paymentMethod,
}) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const transaction = await PaymentTransaction.findOne({
      gatewayData:{
        trackerToken
      }
    }).session(session);

    if (!transaction) {
      throw new Error("Payment transaction not found");
    }

    transaction.status = "ended"

    const newStatus = status.toLowerCase();

    /* =========================
       IDEMPOTENCY GUARD
    ========================= */
    if (transaction.status === newStatus) {
      await session.commitTransaction();
      return transaction;
    }

    transaction.status = newStatus;

    transaction.gatewayData = {
      ...transaction.gatewayData,
      response: raw,
      paymentMethod: paymentMethod
        ? {
            token: paymentMethod.token,
            cardType: paymentMethod.card_type,
            lastFour: paymentMethod.last_four,
          }
        : transaction.gatewayData?.paymentMethod,
    };

    await transaction.save({ session });

    /* =========================
       ROUTE FLOW
    ========================= */
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
   SUCCESS FLOW
========================================================= */
const handleSuccess = async (transaction, session) => {
  if (transaction.payableType === PAYABLE_TYPE.ORDER) {
    const buyerOrder = await BuyerOrder.findById(
      transaction.payableId
    ).session(session);

    if (!buyerOrder) return;

    if (buyerOrder.status === BUYER_ORDER_STATUS.PAID) return;

    buyerOrder.status = BUYER_ORDER_STATUS.PAID;
    await buyerOrder.save({ session });

    const sellerOrders =
      await createSellerOrdersFromBuyerOrder({
        buyerOrder,
        paymentTransaction: transaction._id,
        session,
      });

    buyerOrder.sellerOrders = sellerOrders.map((o) => o._id);
    await buyerOrder.save({ session });

    for (const sellerOrder of sellerOrders) {
      const seller = await ProductSeller.findById(
        sellerOrder.seller
      ).session(session);

      if (!seller) continue;

      const userId = seller.user;

      const existingTxn = await WalletTransaction.findOne({
        referenceModel: MODELS.SELLER_ORDER,
        referenceId: sellerOrder._id,
      }).session(session);

      if (existingTxn) continue;

      const wallet = await getOrCreateWallet(userId, session);

      wallet.pendingBalance =
        (wallet.pendingBalance || 0) +
        (sellerOrder.totalAmount || 0);

      await wallet.save({ session });

      await WalletTransaction.create(
        [
          {
            wallet: wallet._id,
            userId,
            type: WALLET_TRANSACTION_TYPE.ORDER_EARNING,
            amount: sellerOrder.totalAmount || 0,
            referenceModel: MODELS.SELLER_ORDER,
            referenceId: sellerOrder._id,
            status: WALLET_TRANSACTION_STATUS.PENDING,
          },
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

    if (!provider) return;

    const userId = provider.user;

    const existingTxn = await WalletTransaction.findOne({
      referenceModel: MODELS.BOOKING,
      referenceId: booking._id,
    }).session(session);

    if (existingTxn) return;

    const wallet = await getOrCreateWallet(userId, session);

    wallet.pendingBalance =
      (wallet.pendingBalance || 0) + (booking.price || 0);

    await wallet.save({ session });

    await WalletTransaction.create(
      [
        {
          wallet: wallet._id,
          userId,
          type: WALLET_TRANSACTION_TYPE.BOOKING_EARNING,
          amount: booking.price || 0,
          referenceModel: MODELS.BOOKING,
          referenceId: booking._id,
          status: WALLET_TRANSACTION_STATUS.PENDING,
        },
      ],
      { session }
    );
  }

  else {
    logger.error("Invalid payable type");
  }
};

/* =========================================================
   FAILED FLOW
========================================================= */
const handleFailed = async (transaction, session) => {
  const model =
    transaction.payableType === PAYABLE_TYPE.ORDER
      ? BuyerOrder
      : Booking;

  const doc = await model
    .findById(transaction.payableId)
    .session(session);

  if (!doc) return;

  doc.status = "failed";
  await doc.save({ session });
};

const refundPayment = async ({transactionId}) => {
  const paymentTransaction = await PaymentTransaction.findById(transactionId)
  const trackerToken = paymentTransaction?.gatewayData?.trackerToken
  if(trackerToken)
    throw new InternalServerError("Malformed payment transaction document");
  const refundResponse =  await processRefund(trackerToken,paymentTransaction.amount);
  return refundResponse;
}