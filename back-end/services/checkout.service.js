import { createHash } from "node:crypto";
import config from "../config/env.js";
import { ApiError } from "../middleware/errors.js";
import Product from "../models/product.model.js";
import stripe from "../lib/stripe.js";
import {
  createStripeCartMetadata,
  priceToMinorUnits,
  validateCheckoutCart,
} from "../validation/checkout.validation.js";

const INR_MINIMUM_MINOR_UNITS = 50;
const INR_MAXIMUM_MINOR_UNITS = 999999999;

export const createTestCheckoutSession = async ({
  user,
  idempotencyKey,
}) => {
  if (!user?._id) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication required.");
  }

  const cartItems = validateCheckoutCart(user.cartItems);
  const products = await Product.find({
    _id: { $in: cartItems.map(({ productId }) => productId) },
  });
  const productsById = new Map(
    products.map((product) => [product._id.toString(), product]),
  );

  const lineItems = cartItems.map(({ productId, quantity }) => {
    const product = productsById.get(productId);
    if (!product || !Number.isSafeInteger(product.stock) || product.stock < quantity) {
      throw new ApiError(
        409,
        "CART_STALE",
        "A product in your cart is no longer available in that quantity. Refresh your cart and try again.",
      );
    }
    if (
      typeof product.name !== "string" ||
      product.name.trim() === "" ||
      product.name.trim().length > 500
    ) {
      throw new ApiError(
        400,
        "INVALID_PRODUCT_NAME",
        "A product in your cart has a name that cannot be used for checkout.",
      );
    }

    return {
      productId,
      quantity,
      product,
      unitAmount: priceToMinorUnits(product.price),
    };
  });

  const totalMinorUnits = lineItems.reduce(
    (total, item) => total + item.unitAmount * item.quantity,
    0,
  );
  if (
    !Number.isSafeInteger(totalMinorUnits) ||
    totalMinorUnits < INR_MINIMUM_MINOR_UNITS ||
    totalMinorUnits > INR_MAXIMUM_MINOR_UNITS
  ) {
    throw new ApiError(
      400,
      "INVALID_CHECKOUT_TOTAL",
      "The cart total is outside Stripe's supported INR range.",
    );
  }

  const cartMetadata = createStripeCartMetadata(
    lineItems.map(({ productId, quantity, unitAmount }) => ({
      id: productId,
      qty: quantity,
      unitAmount,
    })),
  );

  const userId = user._id.toString();
  const stripeIdempotencyKey = createHash("sha256")
    .update(`${userId}:${idempotencyKey}`)
    .digest("hex");

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      line_items: lineItems.map(({ product, quantity, unitAmount }) => ({
        price_data: {
          currency: "inr",
          product_data: { name: product.name.trim() },
          unit_amount: unitAmount,
        },
        quantity,
      })),
      success_url: `${config.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.CLIENT_URL}/purchase-cancel`,
      metadata: {
        userId,
        expectedTotalMinorUnits: String(totalMinorUnits),
        ...cartMetadata,
      },
    },
    { idempotencyKey: stripeIdempotencyKey },
  );

  let checkoutUrl;
  try {
    checkoutUrl = new URL(session.url);
  } catch {
    throw new ApiError(
      502,
      "CHECKOUT_UNAVAILABLE",
      "Stripe did not return a valid checkout link. Please try again.",
    );
  }

  if (
    checkoutUrl.protocol !== "https:" ||
    checkoutUrl.hostname !== "checkout.stripe.com"
  ) {
    throw new ApiError(
      502,
      "CHECKOUT_UNAVAILABLE",
      "Stripe did not return a valid checkout link. Please try again.",
    );
  }

  return { url: checkoutUrl.toString() };
};
