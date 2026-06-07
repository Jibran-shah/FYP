import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

import { BUYER_ORDER_STATUS } from "../../../constants/order.constants.js";
import { BadRequestError } from "../../../errors/Http.error.js";
import { Cart } from "../../../models/Cart.model.js";
import { BuyerOrder } from "../../../models/BuyerOrder.model.js";
import { PaymentTransaction } from "../../../models/PaymentTransaction.model.js";
import { PAYMENT_STATUS } from "../../../constants/payment.constants.js";

export const checkout = async ({
  userId,
  paymentMethod,
  idempotencyKey
}) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    /* =========================
       1. LOAD CART
    ========================= */
    const cart = await Cart.findOne({ user: userId }).session(session);

    if (!cart || !cart.items.length) {
      throw new BadRequestError("Cart is empty");
    }

    /* =========================
       2. COMPUTE TOTAL
    ========================= */
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );

    if (totalAmount <= 0) {
      throw new BadRequestError("Invalid cart total");
    }

    /* =========================
       3. IDEMPOTENCY CHECK
    ========================= */
    if (idempotencyKey) {
      const existing = await PaymentTransaction.findOne({
        buyer: userId,
        idempotencyKey
      }).session(session);

      if (existing) {
        await session.commitTransaction();

        return {
          buyerOrderId: existing.payableId,
          paymentTransactionId: existing._id,
          transactionId: existing.transactionId,
          amount: existing.amount,
          paymentMethod
        };
      }
    }

    /* =========================
       4. BUILD ORDER ITEMS (FIXED SNAPSHOT)
    ========================= */
    const orderItems = cart.items.map((item) => {
      if (!item.seller) {
        throw new BadRequestError(
          `Cart item missing seller for product ${item.product}`
        );
      }

      return {
        product: item.product,
        seller: item.seller,
        quantity: item.quantity,
        price: item.price
      };
    });

    /* =========================
       5. CREATE ORDER
    ========================= */
    const [order] = await BuyerOrder.create(
      [
        {
          buyer: userId,
          items: orderItems,
          totalAmount,
          status: BUYER_ORDER_STATUS.PENDING
        }
      ],
      { session }
    );

    /* =========================
       6. CREATE PAYMENT
    ========================= */
    const [payment] = await PaymentTransaction.create(
      [
        {
          buyer: userId,
          amount: totalAmount,
          provider: paymentMethod,
          status: PAYMENT_STATUS.PENDING,
          payableType: "order",
          payableId: order._id,
          idempotencyKey: idempotencyKey || null,
          transactionId: uuidv4()
        }
      ],
      { session }
    );

    /* =========================
       7. LINK ORDER → PAYMENT
    ========================= */
    order.paymentTransaction = payment._id;
    await order.save({ session });

    /* =========================
       8. CLEAR CART
    ========================= */
    cart.items = [];
    cart.subtotal = 0;
    cart.totalAmount = 0;
    await cart.save({ session });

    await session.commitTransaction();

    return {
      buyerOrderId: order._id,
      paymentTransactionId: payment._id,
      transactionId: payment.transactionId,
      amount: totalAmount,
      paymentMethod
    };

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};