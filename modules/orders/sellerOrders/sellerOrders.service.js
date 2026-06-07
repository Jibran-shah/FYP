import mongoose from "mongoose";

import { SellerOrder } from "../../../models/SellerOrder.model.js";
import { BuyerOrder } from "../../../models/BuyerOrder.model.js";

import {
  NotFoundError,
  ForbiddenError,
  BadRequestError
} from "../../../errors/Http.error.js";

import { SELLER_ORDER_STATUS } from "../../../constants/order.constants.js";
import { releaseWalletEarning } from "../../accountFunds/wallet/wallet.service.js";

/* =========================================================
   GET MY SELLER ORDERS
========================================================= */
export const getMySellerOrders = async ({
  sellerId,
  status,
  page = 1,
  limit = 10
}) => {


  const query = { seller: sellerId };

  if (status) query.status = status;

  const sellerOrders = await SellerOrder.find(query)
    .populate("buyer")
    .populate("buyerOrder")
    .populate("paymentTransaction")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  console.log(sellerOrders);

  return sellerOrders;
};

/* =========================================================
   GET SINGLE SELLER ORDER
========================================================= */
export const getSellerOrderById = async ({
  sellerOrderId,
  sellerId
}) => {
  const order = await SellerOrder.findById(sellerOrderId)
    .populate("buyer")
    .populate("buyerOrder")
    .populate("paymentTransaction");

  if (!order) {
    throw new NotFoundError("Seller order not found");
  }

  if (order.seller.toString() !== sellerId.toString()) {
    throw new ForbiddenError("Not allowed to access this seller order");
  }

  return order;
};

/* =========================================================
   OWNERSHIP CHECK
========================================================= */
const assertOwnership = (order, sellerId) => {
  if (order.seller.toString() !== sellerId.toString()) {
    throw new ForbiddenError("Not allowed to modify this order");
  }
};

/* =========================================================
   UPDATE STATUS (STATE MACHINE ONLY)
   ❌ BLOCK DELIVERY HERE (ESCROW SAFETY)
========================================================= */
export const updateSellerOrderStatus = async ({
  sellerOrderId,
  sellerId,
  status
}) => {
  const order = await SellerOrder.findById(sellerOrderId);

  if (!order) {
    throw new NotFoundError("Seller order not found");
  }

  assertOwnership(order, sellerId);

  // 🚨 ESCROW PROTECTION: prevent bypassing delivery flow
  if (status === SELLER_ORDER_STATUS.DELIVERED) {
    throw new BadRequestError(
      "Use markAsDelivered for delivery (escrow settlement required)"
    );
  }

  const validTransitions = {
    [SELLER_ORDER_STATUS.PAID]: [SELLER_ORDER_STATUS.PROCESSING],
    [SELLER_ORDER_STATUS.PROCESSING]: [SELLER_ORDER_STATUS.SHIPPED],
    [SELLER_ORDER_STATUS.SHIPPED]: [SELLER_ORDER_STATUS.DELIVERED]
  };

  if (
    !validTransitions[order.status]?.includes(status) &&
    order.status !== status
  ) {
    throw new BadRequestError("Invalid status transition");
  }

  order.status = status;
  await order.save();

  return order;
};

/* =========================================================
   MARK AS DELIVERED (ONLY ESCROW RELEASE POINT)
========================================================= */
export const markAsDelivered = async ({
  sellerOrderId,
  sellerId
}) => {
  const order = await SellerOrder.findById(sellerOrderId);

  if (!order) {
    throw new NotFoundError("Seller order not found");
  }

  assertOwnership(order, sellerId);

  if (order.status !== SELLER_ORDER_STATUS.SHIPPED) {
    throw new BadRequestError("Order must be shipped before delivery");
  }

  order.status = SELLER_ORDER_STATUS.DELIVERED;
  await order.save();

  // 🔥 ESCROW RELEASE (SINGLE SOURCE OF TRUTH)
  await releaseWalletEarning({
    userId: order.seller,
    amount: order.totalAmount,
    referenceId: order._id,
    referenceModel: "SellerOrder"
  });

  return order;
};

/* =========================================================
   CANCEL ORDER
========================================================= */
export const cancelSellerOrder = async ({
  sellerOrderId,
  sellerId
}) => {
  const order = await SellerOrder.findById(sellerOrderId);

  if (!order) {
    throw new NotFoundError("Seller order not found");
  }

  assertOwnership(order, sellerId);

  if (
    order.status === SELLER_ORDER_STATUS.SHIPPED ||
    order.status === SELLER_ORDER_STATUS.DELIVERED
  ) {
    throw new BadRequestError("Cannot cancel after shipping");
  }

  order.status = SELLER_ORDER_STATUS.CANCELLED;
  await order.save();

  return order;
};

export const createSellerOrdersFromBuyerOrder = async ({
  buyerOrder,
  paymentTransaction,
  session
}) => {
  const existing = await SellerOrder.findOne({
    buyerOrder: buyerOrder._id
  }).session(session);

  if (existing) return existing;

  const sellerMap = new Map();

  for (const item of buyerOrder.items) {
    const sellerId = item.seller?.toString();
    if (!sellerId) continue;

    if (!sellerMap.has(sellerId)) {
      sellerMap.set(sellerId, []);
    }

    sellerMap.get(sellerId).push(item);
  }

  const created = [];

  for (const [sellerId, items] of sellerMap.entries()) {
    const totalAmount = items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );

    const [order] = await SellerOrder.create(
      [
        {
          buyerOrder: buyerOrder._id,
          buyer: buyerOrder.buyer,
          seller: sellerId,
          items,
          totalAmount,
          status: "paid",

          // ✅ FIX IS HERE
          paymentTransaction
        }
      ],
      { session }
    );

    created.push(order);
  }

  return created;
};