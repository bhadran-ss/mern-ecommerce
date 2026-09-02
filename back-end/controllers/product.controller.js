import Product from "../models/product.model.js";
import { ApiError } from "../middleware/errors.js";
import {
  cleanupProductImages,
  getProductImageReferences,
  uploadProductImages,
} from "../services/product-image.service.js";
import {
  getProductImageInputs,
  validateProductImageDataUrls,
} from "../validation/product-image.validation.js";
import {
  validateProductBody,
  validateProductCategory,
  validateProductId,
  validateProductSearchName,
} from "../validation/product.validation.js";

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

const getSellerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ sellerId: req.user._id });
    return res.status(200).json({
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
  try {
    validateProductId(id);
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
    const escapedName = validateProductSearchName(name);
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
    validateProductBody(req.body, { creating: true, role: req.user.role });
    const {
      name,
      description,
      price,
      category,
      stock,
    } = req.body;
    const { dataUrls } = getProductImageInputs(req.body);
    validateProductImageDataUrls(dataUrls);
    const logger = req.app.locals.logger;
    const uploadedImages = await uploadProductImages(dataUrls, logger);
    let product;

    try {
      product = await Product.create({
        name,
        description,
        price,
        image: uploadedImages[0]?.secure_url || "",
        images: uploadedImages.map((image) => image.secure_url),
        stock: stock ?? 0,
        category,
        sellerId: req.user._id,
      });
    } catch (error) {
      await cleanupProductImages(uploadedImages, logger);
      throw error;
    }

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
    validateProductId(id);
    validateProductBody(req.body, { role: req.user.role });

    const {
      name,
      description,
      price,
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

    const { dataUrls, field } = getProductImageInputs(req.body);
    validateProductImageDataUrls(dataUrls);
    const logger = req.app.locals.logger;
    const previousImageReferences = getProductImageReferences(product);
    const uploadedImages = await uploadProductImages(dataUrls, logger);

    if (field === "images" && uploadedImages.length > 0) {
      product.images = uploadedImages.map((image) => image.secure_url);
      product.image = uploadedImages[0].secure_url;
    } else if (field === "image" && uploadedImages.length > 0) {
      product.image = uploadedImages[0].secure_url;
      if (!product.images || product.images.length === 0) {
        product.images = [uploadedImages[0].secure_url];
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

    try {
      await product.save();
    } catch (error) {
      await cleanupProductImages(uploadedImages, logger);
      throw error;
    }

    if (uploadedImages.length > 0) {
      const retainedImages = new Set(getProductImageReferences(product));
      const replacedImages = previousImageReferences.filter(
        (imageUrl) => !retainedImages.has(imageUrl),
      );
      await cleanupProductImages(replacedImages, logger);
    }

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
    validateProductId(id);
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

    const imageReferences = getProductImageReferences(product);
    await product.deleteOne();
    await cleanupProductImages(imageReferences, req.app.locals.logger);
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
    const normalizedCategory = validateProductCategory(category);
    const products = await Product.find({ category: normalizedCategory });
    res.status(200).json(products);
  } catch (error) {
    return next(error);
  }
};
const toggleFeaturedProduct = async (req, res, next) => {
  const { id } = req.params;
  try {
    validateProductId(id);
    const product = await Product.findById(id);
    if (!product) {
      return next(new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found."));
    }
    product.isFeatured = !product.isFeatured;
    await product.save();
    res.status(200).json({
      success: true,
      data: {
        _id: product._id,
        isFeatured: product.isFeatured,
      },
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
  getSellerProducts,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductById,
  toggleFeaturedProduct,
  searchProducts,
};
