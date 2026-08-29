import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import Product from "../models/product.model.js";
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
const updateProductFields = new Set([
  ...createProductFields,
  "isFeatured",
]);

const validateProductId = (id, next) => {
  if (!mongoose.isObjectIdOrHexString(id)) {
    next(new ApiError(400, "INVALID_PRODUCT_ID", "Product ID is invalid."));
    return false;
  }
  return true;
};

const validateProductBody = (
  body,
  allowedFields,
  next,
  { creating = false } = {},
) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    next(new ApiError(400, "VALIDATION_ERROR", "Product data must be an object."));
    return false;
  }

  if (Object.keys(body).some((field) => !allowedFields.has(field))) {
    next(new ApiError(400, "VALIDATION_ERROR", "Product data contains unsupported fields."));
    return false;
  }

  if (
    (creating &&
      ["name", "description", "price", "category"].some(
        (field) => !(field in body),
      )) ||
    (!creating && Object.keys(body).length === 0)
  ) {
    next(
      new ApiError(
        400,
        "VALIDATION_ERROR",
        creating
          ? "Name, description, price, and category are required."
          : "At least one product field is required.",
      ),
    );
    return false;
  }

  for (const field of ["name", "description", "category"]) {
    if (field in body && (typeof body[field] !== "string" || !body[field].trim())) {
      next(new ApiError(400, "VALIDATION_ERROR", `${field} must be a non-empty string.`));
      return false;
    }
  }

  if (
    "price" in body &&
    (typeof body.price !== "number" ||
      !Number.isFinite(body.price) ||
      body.price < 0)
  ) {
    next(new ApiError(400, "VALIDATION_ERROR", "Price must be a non-negative number."));
    return false;
  }

  if ("stock" in body && (!Number.isInteger(body.stock) || body.stock < 0)) {
    next(new ApiError(400, "VALIDATION_ERROR", "Stock must be a non-negative whole number."));
    return false;
  }

  if ("image" in body && typeof body.image !== "string") {
    next(new ApiError(400, "VALIDATION_ERROR", "Image must be a string."));
    return false;
  }

  if (
    "images" in body &&
    (!Array.isArray(body.images) ||
      body.images.some((image) => typeof image !== "string"))
  ) {
    next(new ApiError(400, "VALIDATION_ERROR", "Images must be an array of strings."));
    return false;
  }

  if ("isFeatured" in body && typeof body.isFeatured !== "boolean") {
    next(new ApiError(400, "VALIDATION_ERROR", "isFeatured must be a boolean."));
    return false;
  }

  return true;
};

const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return next(error);
  }
};
const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true });
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return next(error);
  }
};
const getProductById = async (req, res, next) => {
  const { id } = req.params;
  if (!validateProductId(id, next)) return;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return next(new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found."));
    }
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};
const searchProducts = async (req, res, next) => {
  const { name } = req.query;
  try {
    if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
      return next(
        new ApiError(
          400,
          "VALIDATION_ERROR",
          "A product name of 1 to 100 characters is required.",
        ),
      );
    }
    const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const products = await Product.find({
      name: { $regex: escapedName, $options: "i" },
    });
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    return next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    if (
      !validateProductBody(req.body, createProductFields, next, {
        creating: true,
      })
    ) {
      return;
    }
    const {
      name,
      description,
      price,
      images = [],
      image,
      category,
      stock,
    } = req.body;
    const uploadedImages = [];

    if (Array.isArray(images) && images.length > 0) {
      for (const file of images) {
        const cloudinaryResponse = await cloudinary.uploader.upload(file, {
          folder: "products",
        });
        uploadedImages.push(cloudinaryResponse.secure_url);
      }
    } else if (image) {
      const cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
      uploadedImages.push(cloudinaryResponse.secure_url);
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: uploadedImages[0] || "",
      images: uploadedImages,
      stock: stock ?? 0,
      category,
      sellerId: req.user._id,
    });
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateProductId(id, next)) return;
    if (!validateProductBody(req.body, updateProductFields, next)) return;
    if (req.user.role !== "admin" && "isFeatured" in req.body) {
      return next(
        new ApiError(
          403,
          "FORBIDDEN",
          "Only administrators can change featured status.",
        ),
      );
    }

    const {
      name,
      description,
      price,
      images = [],
      image,
      category,
      isFeatured,
      stock,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return next(new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found."));
    }

    if (
      req.user.role !== "admin" &&
      product.sellerId.toString() !== req.user._id.toString()
    ) {
      return next(new ApiError(403, "FORBIDDEN", "You can only edit your own products."));
    }

    if (Array.isArray(images) && images.length > 0) {
      const uploadedImages = [];
      for (const file of images) {
        const cloudinaryResponse = await cloudinary.uploader.upload(file, {
          folder: "products",
        });
        uploadedImages.push(cloudinaryResponse.secure_url);
      }
      product.images = uploadedImages;
      product.image = uploadedImages[0] || product.image;
    } else if (image && image !== product.image) {
      const cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
      product.image = cloudinaryResponse.secure_url;
      if (!product.images || product.images.length === 0) {
        product.images = [cloudinaryResponse.secure_url];
      }
    }

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    if (typeof isFeatured === "boolean") {
      product.isFeatured = isFeatured;
    }
    if (typeof stock === "number") {
      product.stock = stock;
    }

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateProductId(id, next)) return;
    const product = await Product.findById(id);
    if (!product) {
      return next(new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found."));
    }

    if (
      req.user.role !== "admin" &&
      product.sellerId.toString() !== req.user._id.toString()
    ) {
      return next(new ApiError(403, "FORBIDDEN", "You can only delete your own products."));
    }

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (error) {
        return next(error);
      }
    }
    await product.deleteOne();
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};
const getProductsByCategory = async (req, res, next) => {
  const { category } = req.params;
  try {
    if (!category.trim() || category.length > 100) {
      return next(
        new ApiError(
          400,
          "VALIDATION_ERROR",
          "Category must be between 1 and 100 characters.",
        ),
      );
    }
    const products = await Product.find({ category: category.trim() });
    res.status(200).json(products);
  } catch (error) {
    return next(error);
  }
};
const toggleFeaturedProduct = async (req, res, next) => {
  const { id } = req.params;
  if (!validateProductId(id, next)) return;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return next(new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found."));
    }
    product.isFeatured = !product.isFeatured;
    await product.save();
    res.status(200).json({
      success: true,
      message: `Product ${
        product.isFeatured ? "featured" : "unfeatured"
      } successfully`,
    });
  } catch (error) {
    return next(error);
  }
};
export {
  getAllProducts,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductById,
  toggleFeaturedProduct,
  searchProducts,
};
