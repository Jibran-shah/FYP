import mongoose from "mongoose";
import { MODELS } from "../constants/models.constants.js";

const { Schema, model, Types } = mongoose;

/*
=====================================================
ORDER STATUS
=====================================================
*/
export const ORDER_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded"
};

export const ORDER_STATUS_ARRAY = Object.values(ORDER_STATUS);

/*
=====================================================
ORDER ITEM
=====================================================
*/
const orderItemSchema = new Schema(
  {
    productId: {
      type: Types.ObjectId,
      required: true,
      ref: MODELS.PRODUCT,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    total: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

/*
=====================================================
ORDER MODEL
=====================================================
*/
const orderSchema = new Schema(
  {
    /*
    👤 User who placed order
    */
    userId: {
      type: Types.ObjectId,
      ref: MODELS.USER,
      required: true,
      index: true
    },

    /*
    📦 Items in order
    */
    items: {
      type: [orderItemSchema],
      required: true,
      validate: v => v.length > 0
    },

    /*
    💰 Pricing
    */
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },

    tax: {
      type: Number,
      default: 0
    },

    shippingFee: {
      type: Number,
      default: 0
    },

    totalAmount: {
      type: Number,
      required: true
    },

    /*
    📌 Status tracking
    */
    status: {
      type: String,
      enum: ORDER_STATUS_ARRAY,
      default: ORDER_STATUS.PENDING,
      index: true
    },

    /*
    💳 Payment tracking
    */
    payment: {
      method: {
        type: String,
        enum: ["cod", "card", "bank", "wallet"],
        default: "cod"
      },

      provider: {
        type: String,
        default: null
      },

      transactionId: {
        type: String,
        default: null,
        index: true
      },

      paidAt: {
        type: Date,
        default: null
      }
    },

    /*
    🚚 Shipping details
    */
    shippingAddress: {
      fullName: String,
      phone: String,
      address: String,
      city: String,
      country: String,
      postalCode: String
    },

    /*
    📦 Delivery tracking
    */
    tracking: {
      carrier: String,
      trackingNumber: String,
      trackingUrl: String
    },

    /*
    🔁 Status history
    */
    statusHistory: [
      {
        status: {
          type: String,
          enum: ORDER_STATUS_ARRAY
        },
        changedAt: {
          type: Date,
          default: Date.now
        },
        note: String
      }
    ],

    /*
    🧠 Soft delete
    */
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/*
=====================================================
INDEXES
=====================================================
*/
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ "payment.transactionId": 1 });

/*
=====================================================
MIDDLEWARE
=====================================================
*/
orderSchema.pre("save", function (next) {

  // auto calculate totals if needed
  if (this.items?.length) {
    this.subtotal = this.items.reduce((sum, item) => {
      return sum + item.total;
    }, 0);

    this.totalAmount = this.subtotal + this.tax + this.shippingFee;
  }

  next();
});

/*
=====================================================
MODEL
=====================================================
*/
export const Order = model(MODELS.ORDER, orderSchema);