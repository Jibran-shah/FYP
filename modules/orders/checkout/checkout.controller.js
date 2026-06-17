import * as checkoutService from "./checkout.service.js";

/* =========================
   CHECKOUT
   Cart -> BuyerOrder + PaymentTransaction
========================= */
export const checkout = async (req, res) => {
  console.log("req.user",req.user);
  const result = await checkoutService.checkout({
    userId: req.user?.id,
  });

  res.status(201).json({
    success: true,
    message: "Checkout created successfully",
    data: result
  });
};