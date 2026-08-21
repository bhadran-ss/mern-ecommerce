import { getCloudinaryClient } from "../config/cloudinary.js";
import Product from "../models/product.model.js";
import { AppError } from "../utils/app-error.js";

const getAllProducts = async (_req, res) => {
  const products = await Product.find();
  res.status(200).json({ success: true, count: products.length, data: products });
};

const getFeaturedProducts = async (_req, res) => {
  const products = await Product.find({ isFeatured: true });
  res.status(200).json({ success: true, count: products.length, data: products });
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  }
  res.status(200).json({ success: true, data: product });
};

const searchProducts = async (req, res) => {
  const { name } = req.query;
  if (!name || name.trim() === "") {
    throw new AppError(
      400,
      "PRODUCT_NAME_REQUIRED",
      "Product name is required.",
    );
  }

  const products = await Product.find({
    name: { $regex: name, $options: "i" },
  });
  res.status(200).json({ success: true, data: products });
};

const uploadProductImages = async ({ images, image }) => {
  const files =
    Array.isArray(images) && images.length > 0 ? images : image ? [image] : [];
  const cloudinary = getCloudinaryClient();
  const uploadedImages = [];
  for (const file of files) {
    const uploaded = await cloudinary.uploader.upload(file, {
      folder: "products",
    });
    uploadedImages.push(uploaded.secure_url);
  }
  return uploadedImages;
};

const createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    images = [],
    image,
    category,
    stock,
  } = req.body;
  const uploadedImages = await uploadProductImages({ images, image });
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

  res.status(201).json({ success: true, data: product });
};

const updateProduct = async (req, res) => {
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
    throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  }
  if (
    req.user.role !== "admin" &&
    product.sellerId.toString() !== req.user._id.toString()
  ) {
    throw new AppError(
      403,
      "PRODUCT_OWNERSHIP_REQUIRED",
      "You can only edit your own products.",
    );
  }

  if (Array.isArray(images) && images.length > 0) {
    const uploadedImages = await uploadProductImages({ images });
    product.images = uploadedImages;
    product.image = uploadedImages[0] || product.image;
  } else if (image && image !== product.image) {
    const [uploadedImage] = await uploadProductImages({ image });
    product.image = uploadedImage;
    if (!product.images || product.images.length === 0) {
      product.images = [uploadedImage];
    }
  }

  product.name = name ?? product.name;
  product.description = description ?? product.description;
  product.price = price ?? product.price;
  product.category = category ?? product.category;
  if (typeof isFeatured === "boolean") product.isFeatured = isFeatured;
  if (typeof stock === "number") product.stock = stock;
  await product.save();

  res.status(200).json({ success: true, data: product });
};

const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  }
  if (
    req.user.role !== "admin" &&
    product.sellerId.toString() !== req.user._id.toString()
  ) {
    throw new AppError(
      403,
      "PRODUCT_OWNERSHIP_REQUIRED",
      "You can only delete your own products.",
    );
  }

  if (product.image) {
    const publicId = product.image.split("/").pop().split(".")[0];
    try {
      await getCloudinaryClient().uploader.destroy(`products/${publicId}`);
    } catch (error) {
      throw new AppError(
        502,
        "IMAGE_DELETE_FAILED",
        "The product image could not be deleted.",
        { cause: error },
      );
    }
  }

  await product.deleteOne();
  res.status(200).json({ success: true, message: "Product deleted successfully" });
};

const getProductsByCategory = async (req, res) => {
  const products = await Product.find({ category: req.params.category });
  if (products.length === 0) {
    throw new AppError(
      404,
      "CATEGORY_PRODUCTS_NOT_FOUND",
      "No products found in this category.",
    );
  }
  res.status(200).json(products);
};

const toggleFeaturedProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  }

  product.isFeatured = !product.isFeatured;
  await product.save();
  res.status(200).json({
    success: true,
    message: `Product ${product.isFeatured ? "featured" : "unfeatured"} successfully`,
  });
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
