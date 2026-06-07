import * as sellerOrdersService from "./sellerOrders.service.js";

/* =========================
   GET MY SELLER ORDERS
========================= */
export const getMySellerOrders = async (req, res) => {
  const sellerId = req.user?.productSeller;

  console.log(req.user)
  console.log(sellerId)

  if (!sellerId) {
    throw new Error("Unauthorized: Seller profile not found");
  }

  const result = await sellerOrdersService.getMySellerOrders({
    sellerId,
    ...req.validated.query
  });

  res.status(200).json({
    success: true,
    message: "Seller orders fetched successfully",
    data: result
  });
};

/* =========================
   GET SINGLE SELLER ORDER
========================= */
export const getSellerOrderById = async (req, res) => {
  const sellerId = req.user?.productSeller;

  if (!sellerId) {
    throw new Error("Unauthorized: Seller profile not found");
  }

  const result = await sellerOrdersService.getSellerOrderById({
    sellerOrderId: req.validated.params.sellerOrderId,
    sellerId
  });

  res.status(200).json({
    success: true,
    message: "Seller order fetched successfully",
    data: result
  });
};

/* =========================
   UPDATE STATUS (SOURCE OF TRUTH)
========================= */
export const updateSellerOrderStatus = async (req, res) => {
  const sellerId = req.user?.productSeller;

  if (!sellerId) {
    throw new Error("Unauthorized: Seller profile not found");
  }

  const result = await sellerOrdersService.updateSellerOrderStatus({
    sellerOrderId: req.validated.params.sellerOrderId,
    sellerId,
    status: req.validated.body.status
  });

  res.status(200).json({
    success: true,
    message: "Seller order status updated successfully",
    data: result
  });
};

/* =========================
   WRAPPERS (CALL STATUS INTERNALLY)
========================= */
export const markAsProcessing = async (req, res) => {
  const sellerId = req.user?.productSeller;

  const result = await sellerOrdersService.markAsProcessing({
    sellerOrderId: req.validated.params.sellerOrderId,
    sellerId
  });

  res.status(200).json({
    success: true,
    message: "Seller order marked as processing",
    data: result
  });
};

export const markAsShipped = async (req, res) => {
  const sellerId = req.user?.productSeller;

  const result = await sellerOrdersService.markAsShipped({
    sellerOrderId: req.validated.params.sellerOrderId,
    sellerId
  });

  res.status(200).json({
    success: true,
    message: "Seller order marked as shipped",
    data: result
  });
};

export const markAsDelivered = async (req, res) => {
  const sellerId = req.user?.productSeller;

  const result = await sellerOrdersService.markAsDelivered({
    sellerOrderId: req.validated.params.sellerOrderId,
    sellerId
  });

  res.status(200).json({
    success: true,
    message: "Seller order marked as delivered",
    data: result
  });
};

/* =========================
   CANCEL ORDER
========================= */
export const cancelSellerOrder = async (req, res) => {
  const sellerId = req.user?.productSeller;

  if (!sellerId) {
    throw new Error("Unauthorized: Seller profile not found");
  }

  const result = await sellerOrdersService.cancelSellerOrder({
    sellerOrderId: req.validated.params.sellerOrderId,
    sellerId
  });

  res.status(200).json({
    success: true,
    message: "Seller order cancelled successfully",
    data: result
  });
};