import mongoose from "mongoose";
import { ApiError } from "../middleware/errors.js";

export const validateCartProductId = (productId) => {
  if (!mongoose.isObjectIdOrHexString(productId)) {
    throw new ApiError(400, "INVALID_PRODUCT_ID", "Product ID is invalid.");
  }

  return new mongoose.Types.ObjectId(productId).toString();
};

export const validateCartQuantity = (quantity) => {
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new ApiError(
      400,
      "INVALID_QUANTITY",
      "Quantity must be a positive whole number.",
    );
  }

  return quantity;
};
