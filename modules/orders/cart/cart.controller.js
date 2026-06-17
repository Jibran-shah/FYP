import * as cartService from "./cart.service.js";

/* =========================
   GET CART
========================= */
export const getCart = async (req, res) => {
  const result = await cartService.getCart({
    userId: req?.user?.id
  });

  res.status(200).json({
    success: true,
    message: "Cart fetched successfully",
    data: result
  });
};

/* =========================
   ADD TO CART
========================= */
export const addToCart = async (req, res) => {
  const result = await cartService.addToCart({
    userId: req.user.id,
    ...req.validated.body
  });

  res.status(200).json({
    success: true,
    message: "Item added to cart successfully",
    data: result
  });
};

/* =========================
   UPDATE CART ITEM
========================= */
export const updateCartItem = async (req, res) => {
  const result = await cartService.updateCartItem({
    userId: req.user.id,
    ...req.validated?.body
  });

  res.status(200).json({
    success: true,
    message: "Cart item updated successfully",
    data: result
  });
};

/* =========================
   REMOVE ITEM FROM CART
========================= */
export const removeCartItem = async (req, res) => {
  const result = await cartService.removeCartItem({
    userId: req.user.id,
    productId: req.validated.params.productId
  });

  res.status(200).json({
    success: true,
    message: "Item removed from cart successfully",
    data: result
  });
};

/* =========================
   CLEAR CART
========================= */
export const clearCart = async (req, res) => {
  const result = await cartService.clearCart({
    userId: req.user.id
  });

  res.status(200).json({
    success: true,
    message: "Cart cleared successfully",
    data: result
  });
};