import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

import { BUYER_ORDER_STATUS } from "../../../constants/order.constants.js";
import {
  PAYMENT_STATUS,
  PAYABLE_TYPE,
} from "../../../constants/payment.constants.js";

import { BadRequestError } from "../../../errors/Http.error.js";

import { Cart } from "../../../models/Cart.model.js";
import { BuyerOrder } from "../../../models/BuyerOrder.model.js";
import { PaymentTransaction } from "../../../models/PaymentTransaction.model.js";

import {
  createCheckoutURL,
} from "../../../utils/payment.utils.js";

export const checkout = async ({ userId }) => {
  const session = await mongoose.startSession();

  let order;
  let payment;

  try {
    session.startTransaction();

    const cart = await Cart.findOne({ user: userId }).session(session);

    if (!cart || cart.items.length === 0) {
      throw new BadRequestError("Cart is empty");
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );

    if (totalAmount <= 0) {
      throw new BadRequestError("Invalid cart total");
    }

    const orderItems = cart.items.map((item) => {
      if (!item.seller) {
        throw new BadRequestError(
          `Missing seller for product ${item.product}`
        );
      }

      return {
        product: item.product,
        seller: item.seller,
        quantity: item.quantity,
        price: item.price,
      };
    });

    /* =========================
       CREATE ORDER
    ========================= */
    const [createdOrder] = await BuyerOrder.create(
      [
        {
          buyer: userId,
          items: orderItems,
          totalAmount,
          status: BUYER_ORDER_STATUS.PENDING,
        },
      ],
      { session }
    );

    order = createdOrder;

    /* =========================
       CREATE PAYMENT
    ========================= */
    const [createdPayment] = await PaymentTransaction.create(
      [
        {
          buyer: userId,
          amount: totalAmount,
          provider: "safepay",
          status: PAYMENT_STATUS.PENDING,
          payableType: PAYABLE_TYPE.ORDER,
          payableId: order._id,
          transactionId: uuidv4(),
        },
      ],
      { session }
    );

    payment = createdPayment;

    /* link payment to order (NO updateOne needed) */
    order.paymentTransaction = payment._id;

    await order.save({ session });

    /* clear cart */
    await Cart.updateOne(
      { _id: cart._id },
      {
        $set: {
          items: [],
          subtotal: 0,
          totalAmount: 0,
        },
      },
      { session }
    );

    /* =========================
       COMMIT DB FIRST
    ========================= */

    const {url:checkoutURL,token} = await createCheckoutURL({
      orderId: order._id.toString(),
      amount: totalAmount,
    });

    console.log("checkoutUrl:__________",checkoutURL)

    /* IMPORTANT: update payment AFTER COMMIT */
    payment.gatewayData = {
      trackerToken: token,
      checkoutURL,
      state: "TRACKER_STARTED",
    };

    await payment.save(); // now SAFE (no session conflict)

    await session.commitTransaction();
    session.endSession();

    return {
      buyerOrderId: order._id,
      paymentTransactionId: payment._id,
      transactionId: payment.transactionId,
      amount: totalAmount,
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};