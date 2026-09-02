import mongoose from "mongoose";

import {
  normalizeCatalogueText,
  normalizeCategoryName,
  normalizeSlug,
} from "../utils/catalogue-normalization.js";

const categoryImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      trim: true,
      required: [true, "Category image URL is required"],
    },
    publicId: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: false },
);

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      minlength: [2, "Category name must contain at least 2 characters"],
      maxlength: [80, "Category name must not exceed 80 characters"],
      set: normalizeCategoryName,
    },
    slug: {
      type: String,
      required: [true, "Category slug is required"],
      maxlength: [100, "Category slug must not exceed 100 characters"],
      set: normalizeSlug,
    },
    description: {
      type: String,
      required: [true, "Category description is required"],
      maxlength: [500, "Category description must not exceed 500 characters"],
      set: normalizeCatalogueText,
    },
    image: {
      type: categoryImageSchema,
      default: undefined,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

categorySchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = this.name;
  }
});

categorySchema.index(
  { slug: 1 },
  { unique: true, name: "category_slug_unique" },
);
categorySchema.index(
  { isActive: 1, name: 1 },
  { name: "category_active_name" },
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
