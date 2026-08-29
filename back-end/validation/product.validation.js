import mongoose from "mongoose";
import { ApiError } from "../middleware/errors.js";

const createProductFields = new Set([
  "name",
  "description",
  "price",
  "images",
  "image",
  "category",
  "stock",
]);
const updateProductFields = new Set([...createProductFields, "isFeatured"]);

export const validateProductId = (id) => {
  if (!mongoose.isObjectIdOrHexString(id)) {
    throw new ApiError(400, "INVALID_PRODUCT_ID", "Product ID is invalid.");
  }
};

export const validateProductSearchName = (name) => {
  if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "A product name of 1 to 100 characters is required.",
    );
  }
  return name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const validateProductCategory = (category) => {
  if (typeof category !== "string" || !category.trim() || category.length > 100) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Category must be between 1 and 100 characters.",
    );
  }
  return category.trim();
};

export const validateProductBody = (
  body,
  { creating = false, role } = {},
) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Product data must be an object.");
  }

  const allowedFields = creating ? createProductFields : updateProductFields;
  if (Object.keys(body).some((field) => !allowedFields.has(field))) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Product data contains unsupported fields.",
    );
  }

  if (
    (creating &&
      ["name", "description", "price", "category"].some(
        (field) => !(field in body),
      )) ||
    (!creating && Object.keys(body).length === 0)
  ) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      creating
        ? "Name, description, price, and category are required."
        : "At least one product field is required.",
    );
  }

  for (const field of ["name", "description", "category"]) {
    if (field in body && (typeof body[field] !== "string" || !body[field].trim())) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        `${field} must be a non-empty string.`,
      );
    }
  }

  if (
    "price" in body &&
    (typeof body.price !== "number" ||
      !Number.isFinite(body.price) ||
      body.price < 0)
  ) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Price must be a non-negative number.",
    );
  }

  if ("stock" in body && (!Number.isInteger(body.stock) || body.stock < 0)) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Stock must be a non-negative whole number.",
    );
  }

  if ("image" in body && body.image !== null && typeof body.image !== "string") {
    throw new ApiError(400, "VALIDATION_ERROR", "Image must be a string.");
  }

  if (
    "images" in body &&
    (!Array.isArray(body.images) ||
      body.images.some((image) => typeof image !== "string"))
  ) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Images must be an array of strings.",
    );
  }

  if ("isFeatured" in body && typeof body.isFeatured !== "boolean") {
    throw new ApiError(400, "VALIDATION_ERROR", "isFeatured must be a boolean.");
  }

  if (!creating && role !== "admin" && "isFeatured" in body) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Only administrators can change featured status.",
    );
  }
};
