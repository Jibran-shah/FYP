export const WALLET_TRANSACTION_TYPE = Object.freeze({
  ORDER_EARNING: "order_earning",
  BOOKING_EARNING: "booking_earning",

  WITHDRAW_REQUEST: "withdraw_request",
  WITHDRAW_APPROVED: "withdraw_approved",
  RELEASE:"release",
  REFUND: "refund",
  ADJUSTMENT: "adjustment"
});

export const WALLET_TRANSACTION_TYPE_ARRAY = Object.freeze(
  Object.values(WALLET_TRANSACTION_TYPE)
);

export const WALLET_TRANSACTION_STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  COMPLETED: "completed"
});

export const WALLET_TRANSACTION_STATUS_ARRAY = Object.freeze(
  Object.values(WALLET_TRANSACTION_STATUS)
);

export const WITHDRAW_REQUEST_STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  PAID: "paid"
});

export const WITHDRAW_REQUEST_STATUS_ARRAY = Object.freeze(
  Object.values(WITHDRAW_REQUEST_STATUS)
);