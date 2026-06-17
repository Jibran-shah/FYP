import {
  NotFoundError,
  BadRequestError,
} from "../../../errors/Http.error.js";

import { Cart } from "../../../models/Cart.model.js";
import Product from "../../../models/Product.model.js";

/* =========================
   HELPER
========================= */
const calculateSubtotal = (cart) => {
  return cart.items.reduce((sum, item) => sum + item.total, 0);
};

/* =========================
   GET CART
========================= */
export const getCart = async ({ userId }) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      subtotal: 0,
    });
  }

  return cart;
};

/* =========================
   ADD TO CART
========================= */
export const addToCart = async ({
  userId,
  productId,
  quantity,
}) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new NotFoundError("product not found");
  }

  if (product.quantityAvailable < quantity) {
    throw new BadRequestError("not enough stock available");
  }

  const sellerId = product.seller;
  const cart = await getCart({ userId });

  const price = product.price;

  const existingItem = cart.items.find(
    (item) =>
      item.product.toString() === productId &&
      item.seller.toString() === sellerId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.price = price;
    existingItem.total = existingItem.quantity * price;
  } else {
    cart.items.push({
      product: productId,
      seller: sellerId,
      name: product.name,
      price,
      quantity,
      total: price * quantity,
    });
  }

  cart.subtotal = calculateSubtotal(cart);

  await cart.save();
  return cart;
};

/* =========================
   UPDATE CART ITEM
========================= */
export const updateCartItem = async ({
  userId,
  productId,
  quantity,
}) => {
  const cart = await getCart({ userId });

  const item = cart.items.find(
    (i) => i.product.toString() === productId
  );

  if (!item) {
    throw new NotFoundError("Cart item not found");
  }

  if (quantity <= 0) {
    throw new BadRequestError("quantity must be greater than 0");
  }

  item.quantity = quantity;
  item.total = item.price * quantity;

  cart.subtotal = calculateSubtotal(cart);

  await cart.save();
  return cart;
};

/* =========================
   REMOVE ITEM
========================= */
export const removeCartItem = async ({
  userId,
  productId,
}) => {
  const cart = await getCart({ userId });

  const initialLength = cart.items.length;

  cart.items = cart.items.filter(
    (i) => i.product.toString() !== productId
  );

  if (cart.items.length === initialLength) {
    throw new NotFoundError("Item not found in cart");
  }

  cart.subtotal = calculateSubtotal(cart);

  await cart.save();
  return cart;
};

/* =========================
   CLEAR CART
========================= */
export const clearCart = async ({ userId }) => {
  const cart = await getCart({ userId });

  cart.items = [];
  cart.subtotal = 0;

  await cart.save();
  return cart;
};