import mongoose from "mongoose";
import { ApiError } from "../middleware/errors.js";

const MAX_STRIPE_METADATA_CHUNKS = 47;
const STRIPE_METADATA_VALUE_LIMIT = 500;

const invalidSession = () =>
  new ApiError(
    400,
    "INVALID_CHECKOUT_SESSION",
    "The checkout session could not be verified.",
  );

export const validateCheckoutSessionForFulfillment = (session, lineItems) => {
  if (
    session?.livemode !== false ||
    session.mode !== "payment" ||
    session.status !== "complete" ||
    session.payment_status !== "paid" ||
    session.currency !== "inr" ||
    !mongoose.isObjectIdOrHexString(session.metadata?.userId)
  ) {
    throw invalidSession();
  }

  const expectedTotalMinorUnits = Number(
    session.metadata.expectedTotalMinorUnits,
  );
  if (
    !/^[1-9]\d*$/.test(session.metadata.expectedTotalMinorUnits || "") ||
    !Number.isSafeInteger(expectedTotalMinorUnits) ||
    session.amount_total !== expectedTotalMinorUnits
  ) {
    throw invalidSession();
  }

  const chunkCountValue = session.metadata.cartItemChunkCount;
  if (
    !/^[1-9]\d*$/.test(chunkCountValue || "") ||
    Number(chunkCountValue) > MAX_STRIPE_METADATA_CHUNKS
  ) {
    throw invalidSession();
  }
  const chunkCount = Number(chunkCountValue);
  const cartChunks = Array.from({ length: chunkCount }, (_, index) => {
    const chunk = session.metadata[`cartItems${index}`];
    if (
      typeof chunk !== "string" ||
      chunk.length === 0 ||
      chunk.length > STRIPE_METADATA_VALUE_LIMIT ||
      (index < chunkCount - 1 && chunk.length !== STRIPE_METADATA_VALUE_LIMIT)
    ) {
      throw invalidSession();
    }
    return chunk;
  });

  let cartItems;
  try {
    cartItems = JSON.parse(cartChunks.join(""));
  } catch {
    throw invalidSession();
  }

  if (
    !Array.isArray(cartItems) ||
    cartItems.length === 0 ||
    cartItems.length > 100 ||
    !Array.isArray(lineItems?.data) ||
    lineItems.has_more ||
    lineItems.data.length !== cartItems.length
  ) {
    throw invalidSession();
  }

  const productIds = new Set();
  let calculatedTotalMinorUnits = 0;
  const products = cartItems.map((item, index) => {
    if (
      !mongoose.isObjectIdOrHexString(item?.id) ||
      !Number.isSafeInteger(item.qty) ||
      item.qty < 1 ||
      !Number.isSafeInteger(item.unitAmount) ||
      item.unitAmount < 1 ||
      productIds.has(item.id)
    ) {
      throw invalidSession();
    }

    const lineItem = lineItems.data[index];
    const expectedLineTotal = item.qty * item.unitAmount;
    if (
      !lineItem ||
      !Number.isSafeInteger(expectedLineTotal) ||
      lineItem.quantity !== item.qty ||
      lineItem.amount_subtotal !== expectedLineTotal ||
      lineItem.amount_total !== expectedLineTotal ||
      typeof lineItem.description !== "string" ||
      lineItem.description.trim() === ""
    ) {
      throw invalidSession();
    }

    productIds.add(item.id);
    calculatedTotalMinorUnits += expectedLineTotal;
    if (!Number.isSafeInteger(calculatedTotalMinorUnits)) {
      throw invalidSession();
    }

    return {
      productId: item.id,
      quantity: item.qty,
      productName: lineItem.description.trim(),
      unitAmountMinorUnits: item.unitAmount,
    };
  });

  if (calculatedTotalMinorUnits !== expectedTotalMinorUnits) {
    throw invalidSession();
  }

  return {
    userId: session.metadata.userId,
    products,
    totalAmountMinorUnits: expectedTotalMinorUnits,
  };
};
