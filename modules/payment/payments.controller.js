import * as paymentTransactionsService from "./payments.service.js";

/* =========================
   CREATE PAYMENT TRANSACTION
========================= */
export const createPaymentTransaction = async (req, res) => {
  const result = await paymentTransactionsService.createPaymentTransaction({
    buyerId: req.user.id,
    ...req.validated.body
  });

  res.status(201).json({
    success: true,
    message: "Payment transaction created successfully",
    data: result
  });
};

/* =========================
   GET MY PAYMENT TRANSACTIONS
========================= */
export const getMyPaymentTransactions = async (req, res) => {
  const result = await paymentTransactionsService.getMyPaymentTransactions({
    buyerId: req.user.id,
    ...req.validated.query
  });

  res.status(200).json({
    success: true,
    message: "Payment transactions fetched successfully",
    data: result
  });
};

/* =========================
   GET SINGLE TRANSACTION
========================= */
export const getPaymentTransactionById = async (req, res) => {
  const result = await paymentTransactionsService.getPaymentTransactionById({
    transactionId: req.validated.params.transactionId,
    buyerId: req.user.id
  });

  res.status(200).json({
    success: true,
    message: "Payment transaction fetched successfully",
    data: result
  });
};

/* =========================
   WEBHOOK (ONLY SYSTEM ENTRY POINT)
========================= */
export const handlePaymentWebhook = async (req, res) => {
  // IMPORTANT: assume signature verification is handled in service OR middleware
  const result = await paymentTransactionsService.handlePaymentWebhook({
    headers: req.headers,
    body: req.validated?.body,
    gatewayTransactionId:req.validated?.body.gatewayTransactionId,
    status:req.validated?.body.status
  });

  res.status(200).json({
    success: true,
    message: "Webhook processed successfully",
    data: result
  });
};