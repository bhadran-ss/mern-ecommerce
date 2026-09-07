import Category from "../models/category.model.js";
import Product from "../models/product.model.js";

export const slugifyCategory = (value) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const findActiveCategoryName = async (slug) => {
  const managedCategory = await Category.findOne({ slug }).lean();
  if (managedCategory) {
    return managedCategory.isActive ? managedCategory.name : null;
  }

  const legacyCategories = await Product.distinct("category");
  return (
    legacyCategories.find(
      (name) => typeof name === "string" && slugifyCategory(name) === slug,
    ) ?? null
  );
};
