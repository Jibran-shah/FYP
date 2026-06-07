import { BuyerOrder } from "../../../models/BuyerOrder.model.js";

import {
  NotFoundError,
  BadRequestError,
  ForbiddenError
} from "../../../errors/index.js";

/* =========================
   GET MY BUYER ORDERS
========================= */
export const getMyBuyerOrders = async ({
  buyerId,
  status,
  page = 1,
  limit = 10
}) => {
  const query = { buyer: buyerId };

  if (status) {
    query.status = status;
  }

  return BuyerOrder.find(query)
    .populate("sellerOrders")
    .populate("paymentTransaction")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
};

/* =========================
   GET SINGLE BUYER ORDER
========================= */
export const getBuyerOrderById = async ({
  buyerOrderId,
  buyerId
}) => {
  const order = await BuyerOrder.findById(buyerOrderId)
    .populate("sellerOrders")
    .populate("paymentTransaction")
    .populate("items.product");

  if (!order) {
    throw new NotFoundError("Buyer order not found");
  }

  if (order.buyer.toString() !== buyerId.toString()) {
    throw new ForbiddenError("Not allowed to access this order");
  }

  return order;
};

/* =========================
   UPDATE ORDER STATUS (ESCROW SAFE)
   USER SHOULD ONLY CHANGE NON-FINANCIAL STATES
========================= */
export const updateBuyerOrderStatus = async ({
  buyerOrderId,
  buyerId,
  status
}) => {
  const order = await BuyerOrder.findById(buyerOrderId);

  if (!order) {
    throw new NotFoundError("Buyer order not found");
  }

  if (order.buyer.toString() !== buyerId.toString()) {
    throw new ForbiddenError("Not allowed to update this order");
  }

  /* =========================
     BLOCK ALL FINANCIAL STATES
  ========================= */
  const PROTECTED_STATES = [
    "pending",
    "paid",
    "processing",
    "completed",
    "refunded"
  ];

  if (PROTECTED_STATES.includes(status)) {
    throw new BadRequestError(
      "Financial/order-processing states cannot be updated manually"
    );
  }

  order.status = status;
  await order.save();

  return order;
};

/* =========================
   CANCEL ORDER (ESCROW SAFE)
========================= */
export const cancelBuyerOrder = async ({
  buyerOrderId,
  buyerId
}) => {
  const order = await BuyerOrder.findById(buyerOrderId);

  if (!order) {
    throw new NotFoundError("Buyer order not found");
  }

  if (order.buyer.toString() !== buyerId.toString()) {
    throw new ForbiddenError("Not allowed to cancel this order");
  }

  /* =========================
     ESCROW SAFETY RULE
     BLOCK IF PAYMENT ALREADY STARTED
  ========================= */
  const NON_CANCELABLE_STATES = [
    "paid",
    "processing",
    "completed",
    "refunded"
  ];

  if (NON_CANCELABLE_STATES.includes(order.status)) {
    throw new BadRequestError(
      `Cannot cancel order in ${order.status} state (payment already processed)`
    );
  }

  order.status = "cancelled";
  await order.save();

  return order;
};