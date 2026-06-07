import * as walletTransactionService from "./walletTransactions.service.js";

/* =========================
   GET WALLET TRANSACTIONS
========================= */
export const getMyWalletTransactions = async (req, res) => {
  const result = await walletTransactionService.getMyWalletTransactions({
    userId: req.user.id,
    ...req.validated.query
  });

  res.status(200).json({
    success: true,
    message: "Wallet transactions fetched successfully",
    data: result
  });
};

/* =========================
   GET SINGLE WALLET TRANSACTION
========================= */
export const getWalletTransactionById = async (req, res) => {
  const result = await walletTransactionService.getWalletTransactionById({
    transactionId: req.validated.params.transactionId,
    userId: req.user.id
  });

  res.status(200).json({
    success: true,
    message: "Wallet transaction fetched successfully",
    data: result
  });
};

/* =========================
   ADMIN: CREATE WALLET TRANSACTION
   (manual adjustment / correction / bonus / penalty)
========================= */
export const createManualTransaction = async (req, res) => {
  const result = await walletTransactionService.createManualTransaction({
    adminId: req.user.id,
    ...req.validated.body
  });

  res.status(201).json({
    success: true,
    message: "Wallet transaction created successfully",
    data: result
  });
};