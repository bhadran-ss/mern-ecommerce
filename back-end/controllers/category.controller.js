import mongoose from "mongoose";
import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import { ApiError } from "../middleware/errors.js";
import {
  escapeRegExp,
  findActiveCategoryName,
  slugifyCategory,
} from "../utils/category.js";

const getCategoryName = (category) => {
  if (typeof category !== "string") return "";
  return category.trim();
};

const categoryInput = (body) => {
  const name = getCategoryName(body?.name);
  const description =
    body?.description === undefined
      ? ""
      : typeof body.description === "string"
        ? body.description.trim()
        : null;
  const image =
    body?.image === undefined
      ? ""
      : typeof body.image === "string"
        ? body.image.trim()
        : null;
  const slug = slugifyCategory(name);

  if (
    name.length < 2 ||
    name.length > 60 ||
    !slug ||
    slug.length > 70 ||
    description === null ||
    description.length > 300 ||
    image === null ||
    image.length > 500
  ) {
    return null;
  }

  if (image) {
    try {
      if (new URL(image).protocol !== "https:") return null;
    } catch {
      return null;
    }
  }

  return { name, slug, description, image };
};

const getLegacyCategories = (names, managedCategories) => {
  const existingSlugs = new Set(managedCategories.map(({ slug }) => slug));
  return names.flatMap((value) => {
    if (typeof value !== "string" || !value.trim()) return [];
    const name = value.trim();
    const slug = slugifyCategory(name);
    if (!slug || existingSlugs.has(slug)) return [];
    existingSlugs.add(slug);
    return [
      {
        name,
        slug,
        description: "",
        image: "",
        isActive: true,
        isLegacy: true,
      },
    ];
  });
};

const getCategories = async (_req, res, next) => {
  try {
    const [allManagedCategories, legacyNames] = await Promise.all([
      Category.find().sort({ name: 1 }).lean(),
      Product.distinct("category"),
    ]);
    const categories = [
      ...allManagedCategories.filter(({ isActive }) => isActive),
      ...getLegacyCategories(legacyNames, allManagedCategories),
    ].sort((left, right) => left.name.localeCompare(right.name));

    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return next(error);
  }
};

const getAdminCategories = async (_req, res, next) => {
  try {
    const [managedCategories, legacyNames] = await Promise.all([
      Category.find().sort({ name: 1 }).lean(),
      Product.distinct("category"),
    ]);
    const categories = [
      ...managedCategories,
      ...getLegacyCategories(legacyNames, managedCategories),
    ].sort((left, right) => left.name.localeCompare(right.name));

    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return next(error);
  }
};

const createCategory = async (req, res, next) => {
  const input = categoryInput(req.body);
  if (!input) {
    return next(
      new ApiError(
        400,
        "VALIDATION_ERROR",
        "Provide a category name (2 to 60 characters), a description up to 300 characters, and an optional HTTPS image URL.",
      ),
    );
  }

  try {
    const existing = await Category.findOne({ slug: input.slug });
    if (existing) {
      if (existing.isActive) {
        return next(
          new ApiError(
            409,
            "CATEGORY_EXISTS",
            "A category with this name already exists.",
          ),
        );
      }

      existing.name = input.name;
      existing.description = input.description;
      existing.image = input.image;
      existing.isActive = true;
      await existing.save();
      return res.status(200).json({
        success: true,
        data: existing,
        message: "Category reactivated.",
      });
    }

    const category = await Category.create(input);
    return res.status(201).json({
      success: true,
      data: category,
      message: "Category created.",
    });
  } catch (error) {
    if (error?.code === 11000) {
      return next(
        new ApiError(409, "CATEGORY_EXISTS", "A category with this name already exists."),
      );
    }
    return next(error);
  }
};

const deactivateCategory = async (req, res, next) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return next(
      new ApiError(400, "INVALID_CATEGORY_ID", "Category ID is invalid."),
    );
  }

  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return next(
        new ApiError(404, "CATEGORY_NOT_FOUND", "Managed category not found."),
      );
    }

    const productsUsingCategory = await Product.countDocuments({
      category: {
        $regex: `^${escapeRegExp(category.name)}$`,
        $options: "i",
      },
    });
    if (productsUsingCategory > 0) {
      return next(
        new ApiError(
          409,
          "CATEGORY_IN_USE",
          "Move or remove products in this category before deactivating it.",
        ),
      );
    }

    category.isActive = false;
    await category.save();
    return res.status(200).json({
      success: true,
      message: "Category deactivated.",
      data: category,
    });
  } catch (error) {
    return next(error);
  }
};

const getProductsForCategory = async (req, res, next) => {
  const slug = req.params.slug;
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) {
    return next(
      new ApiError(400, "INVALID_CATEGORY", "Category name is invalid."),
    );
  }

  try {
    const name = await findActiveCategoryName(slug.toLowerCase());
    if (!name) {
      return next(
        new ApiError(404, "CATEGORY_NOT_FOUND", "This category is unavailable."),
      );
    }

    const products = await Product.find({
      category: { $regex: `^${escapeRegExp(name)}$`, $options: "i" },
    });
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return next(error);
  }
};

export {
  createCategory,
  deactivateCategory,
  getAdminCategories,
  getCategories,
  getProductsForCategory,
};
