import * as withdrawService from "./withdrawRequests.service.js";

/* =========================
   CREATE REQUEST
========================= */
export const createWithdrawRequest = async (req, res) => {
  const result = await withdrawService.createWithdrawRequest({
    userId: req.user.id,
    ...req.validated.body
  });

  res.status(201).json({
    success: true,
    message: "Withdraw request created",
    data: result
  });
};

/* =========================
   GET MY REQUESTS
========================= */
export const getMyWithdrawRequests = async (req, res) => {
  const result = await withdrawService.getMyWithdrawRequests({
    userId: req.user.id,
    ...req.validated.query
  });

  res.status(200).json({
    success: true,
    message: "Withdraw requests fetched",
    data: result
  });
};

/* =========================
   GET BY ID
========================= */
export const getWithdrawRequestById = async (req, res) => {
  const result = await withdrawService.getWithdrawRequestById({
    withdrawRequestId: req.validated.params.withdrawRequestId,
    userId: req.user.id
  });

  res.status(200).json({
    success: true,
    message: "Withdraw request fetched",
    data: result
  });
};

/* =========================
   ADMIN UPDATE STATUS
========================= */
export const updateWithdrawRequestStatus = async (req, res) => {
  const result = await withdrawService.updateWithdrawRequestStatus({
    withdrawRequestId: req.validated.params.withdrawRequestId,
    status: req.validated.body.status,
    adminNote: req.validated.body.adminNote,
    adminId: req.user.id
  });

  res.status(200).json({
    success: true,
    message: "Withdraw request updated",
    data: result
  });
};