import mongoose from "mongoose";
import { InternalServerError } from "../../errors";

const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    // PK: MongoDB _id replaces order_id

    /* ======================
       RELATIONSHIPS
    ====================== */
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true
    },

    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      index: true
    },

    /* ======================
       ORDER DETAILS
    ====================== */
    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    /*
      Store money in smallest unit
      e.g. paisa / cents
    */
    price: {
      type: Number,
      required: true,
      min: 0
    },

    /* ======================
       STATUS & LIFECYCLE
    ====================== */
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled"
      ],
      default: "pending",
      index: true
    },

    orderDate: {
      type: Date,
      default: Date.now,
      index: true
    },

    deliveryDate: {
      type: Date
    },

    /* ======================
       SOFT DELETE
    ====================== */
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
  }
);


orderSchema.index({ buyer: 1, orderDate: -1 });
orderSchema.index({ seller: 1, orderDate: -1 });
orderSchema.index({ product: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ isDeleted: 1 });



orderSchema.pre("validate", function (next) {
  if (this.buyer.equals(this.seller)) {
    return next(new IntersectionObserver("Buyer and seller cannot be the same"));
  }
  next();
});


orderSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === "delivered" &&
    !this.deliveryDate
  ) {
    this.deliveryDate = new Date();
  }
  next();
});


orderSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});



const allowedTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: []
};

orderSchema.methods.changeStatus = function (newStatus) {
  const allowed = allowedTransitions[this.status];
  if (!allowed.includes(newStatus)) {
    throw new InternalServerError(
      `Invalid status change: ${this.status} → ${newStatus}`
    );
  }

  this.status = newStatus;
};



orderSchema.statics.calculateTotalPrice = function (price, quantity) {
  return price * quantity;
};


const Order = mongoose.model("Order", orderSchema);

export default Order;
