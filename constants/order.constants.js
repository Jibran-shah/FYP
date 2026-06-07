export const BUYER_ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  PROCESSING: "processing",
  PARTIALLY_SHIPPED: "partially_shipped",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded"
});

export const BUYER_ORDER_STATUS_ARRAY = Object.freeze(
  Object.values(BUYER_ORDER_STATUS)
);

/* =========================================================
   SELLER ORDER STATUS (separate but aligned subset)
========================================================= */
export const SELLER_ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded"
});

export const SELLER_ORDER_STATUS_ARRAY = Object.freeze(
  Object.values(SELLER_ORDER_STATUS)
);