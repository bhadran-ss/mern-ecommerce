import cloudinary from "../config/cloudinary.js";
import Product from "../models/product.model.js";
import { ApiError } from "../middleware/errors.js";

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
    if (!name || name.trim() === "") {
      return next(new ApiError(400, "VALIDATION_ERROR", "Product name is required."));
    }
    const products = await Product.find({
      name: { $regex: name, $options: "i" },
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
    const products = await Product.find({ category });
    if (products.length === 0) {
      return next(new ApiError(404, "PRODUCTS_NOT_FOUND", "No products found in this category."));
    }
    res.status(200).json(products);
  } catch (error) {
    return next(error);
  }
};
const toggleFeaturedProduct = async (req, res, next) => {
  const { id } = req.params;
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
