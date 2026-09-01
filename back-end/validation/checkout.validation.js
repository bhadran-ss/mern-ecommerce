import mongoose from "mongoose";
import { ApiError } from "../middleware/errors.js";

const MAX_CART_ITEMS = 100;
const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const validateCheckoutIdempotencyKey = (value) => {
  if (typeof value !== "string" || !UUID_V4_PATTERN.test(value)) {
    throw new ApiError(
      400,
      "INVALID_CHECKOUT_REQUEST",
      "A valid checkout request key is required. Please try again.",
    );
  }

  return value.toLowerCase();
};

export const validateCheckoutCart = (cartItems) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new ApiError(400, "INVALID_CART", "Your cart is empty.");
  }

  if (cartItems.length > MAX_CART_ITEMS) {
    throw new ApiError(
      400,
      "INVALID_CART",
      "Your cart has too many items to start checkout.",
    );
  }

  const quantitiesByProduct = new Map();

  for (const item of cartItems) {
    const productReference = item?.product?._id ?? item?.product;
    if (!mongoose.isObjectIdOrHexString(productReference)) {
      throw new ApiError(
        409,
        "CART_STALE",
        "Your cart contains an unavailable product. Refresh it and try again.",
      );
    }

    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) {
      throw new ApiError(
        400,
        "INVALID_CART",
        "Your cart contains an invalid quantity.",
      );
    }

    const productId = new mongoose.Types.ObjectId(productReference).toString();
    const quantity = (quantitiesByProduct.get(productId) || 0) + item.quantity;
    if (!Number.isSafeInteger(quantity)) {
      throw new ApiError(
        400,
        "INVALID_CART",
        "Your cart contains an invalid quantity.",
      );
    }

    quantitiesByProduct.set(productId, quantity);
  }

  return [...quantitiesByProduct].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
};

export const priceToMinorUnits = (price) => {
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    throw new ApiError(
      400,
      "INVALID_PRODUCT_PRICE",
      "A product in your cart has an invalid price.",
    );
  }

  const amount = Math.round(price * 100);
  if (
    !Number.isSafeInteger(amount) ||
    Math.abs(price - amount / 100) > 1e-8
  ) {
    throw new ApiError(
      400,
      "INVALID_PRODUCT_PRICE",
      "A product price cannot be represented in INR minor units.",
    );
  }

  return amount;
};
