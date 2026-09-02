import mongoose from "mongoose";

import {
  normalizeCatalogueText,
  normalizeSku,
  normalizeSlug,
  normalizeTags,
} from "../utils/catalogue-normalization.js";

export const PRODUCT_STATUSES = Object.freeze([
  "draft",
  "pending",
  "active",
  "archived",
]);

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      trim: true,
      required: [true, "Image URL is required"],
    },
    publicId: {
      type: String,
      trim: true,
      default: null,
    },
    alt: {
      type: String,
      trim: true,
      maxlength: [160, "Image alternative text must not exceed 160 characters"],
      default: "",
    },
  },
  { _id: false },
);

const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, "Variant SKU is required"],
      maxlength: [80, "Variant SKU must not exceed 80 characters"],
      set: normalizeSku,
    },
    colour: {
      type: String,
      required: [true, "Variant colour is required"],
      maxlength: [60, "Variant colour must not exceed 60 characters"],
      set: normalizeCatalogueText,
    },
    size: {
      type: String,
      required: [true, "Variant size is required"],
      maxlength: [40, "Variant size must not exceed 40 characters"],
      set: normalizeCatalogueText,
    },
    priceInPaise: {
      type: Number,
      required: [true, "Variant price is required"],
      min: [1, "Variant price must be positive"],
      validate: {
        validator: Number.isInteger,
        message: "Variant price must be an integer number of paise",
      },
    },
    inventory: {
      type: Number,
      default: 0,
      min: [0, "Variant inventory cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Variant inventory must be an integer",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const ratingSummarySchema = new mongoose.Schema(
  {
    average: {
      type: Number,
      default: 0,
      min: [0, "Average rating cannot be negative"],
      max: [5, "Average rating cannot exceed 5"],
    },
    count: {
      type: Number,
      default: 0,
      min: [0, "Rating count cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Rating count must be an integer",
      },
    },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      minlength: [2, "Product name must contain at least 2 characters"],
      maxlength: [160, "Product name must not exceed 160 characters"],
      set: normalizeCatalogueText,
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      maxlength: [180, "Product slug must not exceed 180 characters"],
      set: normalizeSlug,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [5_000, "Product description must not exceed 5000 characters"],
      set: normalizeCatalogueText,
    },
    brand: {
      type: String,
      required: [true, "Product brand is required"],
      maxlength: [100, "Product brand must not exceed 100 characters"],
      set: normalizeCatalogueText,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    tags: {
      type: [String],
      default: [],
      set: normalizeTags,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Product seller is required"],
    },
    status: {
      type: String,
      enum: PRODUCT_STATUSES,
      default: "draft",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    images: {
      type: [imageSchema],
      default: [],
    },
    variants: {
      type: [variantSchema],
      required: [true, "At least one product variant is required"],
      validate: [
        {
          validator: (variants) => Array.isArray(variants) && variants.length > 0,
          message: "At least one product variant is required",
        },
        {
          validator: (variants) => {
            const skus = variants.map((variant) => variant.sku);
            return new Set(skus).size === skus.length;
          },
          message: "Variant SKUs must be unique within a product",
        },
      ],
    },
    ratingSummary: {
      type: ratingSummarySchema,
      default: () => ({ average: 0, count: 0 }),
    },
  },
  { timestamps: true },
);

productSchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = this.name;
  }
});

productSchema.index(
  { slug: 1 },
  { unique: true, name: "product_slug_unique" },
);
productSchema.index(
  { "variants.sku": 1 },
  { unique: true, name: "product_variant_sku_unique" },
);
productSchema.index(
  { seller: 1, status: 1 },
  { name: "product_seller_status" },
);
productSchema.index(
  { category: 1, status: 1 },
  { name: "product_category_status" },
);
productSchema.index(
  { status: 1, isFeatured: -1 },
  { name: "product_status_featured" },
);

productSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    delete returnedObject.__v;
    return returnedObject;
  },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
