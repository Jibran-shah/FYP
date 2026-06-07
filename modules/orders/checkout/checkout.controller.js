import * as checkoutService from "./checkout.service.js";

/* =========================
   CHECKOUT
   Cart -> BuyerOrder + PaymentTransaction
========================= */
export const checkout = async (req, res) => {
  const { paymentMethod, idempotencyKey } = req.validated.body;

  const result = await checkoutService.checkout({
    userId: req.user.id,
    paymentMethod,
    idempotencyKey
  });

  res.status(201).json({
    success: true,
    message: "Checkout created successfully",
    data: result
  });
};