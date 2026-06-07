import * as buyerOrdersService from "./buyerOrders.service.js";

/* =========================
   GET MY BUYER ORDERS
========================= */
export const getMyBuyerOrders = async (req, res) => {
  const result = await buyerOrdersService.getMyBuyerOrders({
    buyerId: req.user.id,
    ...req.validated.query
  });

  res.status(200).json({
    success: true,
    message: "Buyer orders fetched successfully",
    data: result
  });
};

/* =========================
   GET SINGLE BUYER ORDER
========================= */
export const getBuyerOrderById = async (req, res) => {
  const result = await buyerOrdersService.getBuyerOrderById({
    buyerOrderId: req.validated.params.buyerOrderId,
    buyerId: req.user.id
  });

  res.status(200).json({
    success: true,
    message: "Buyer order fetched successfully",
    data: result
  });
};

/* =========================
   UPDATE ORDER STATUS
   (ESCROW SAFETY: SHOULD BE INTERNAL ONLY)
========================= */
export const updateBuyerOrderStatus = async (req, res) => {
  throw new Error(
    "BuyerOrder status updates must be handled via payment webhook or internal system only"
  );
};

/* =========================
   CANCEL ORDER
   (allowed buyer action)
========================= */
export const cancelBuyerOrder = async (req, res) => {
  const result = await buyerOrdersService.cancelBuyerOrder({
    buyerOrderId: req.validated.params.buyerOrderId,
    buyerId: req.user.id
  });

  res.status(200).json({
    success: true,
    message: "Buyer order cancelled successfully",
    data: result
  });
};