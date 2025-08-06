import cloudinary from "../config/cloudinary.js";
import Product from "../models/product.model.js";

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true });
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
const searchProducts = async (req, res) => {
  const { name } = req.query;
  console.log("Search query:", name);
  try {
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }
    const products = await Product.find({
      name: { $regex: name, $options: "i" },
    });
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }
    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse ? cloudinaryResponse.secure_url : "",
      category,
    });
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        return res.status(500).json({
          success: false,
          message: "Error deleting image from Cloudinary",
        });
      }
    }
    await product.deleteOne();
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found in this category",
      });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
const toggleFeaturedProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
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
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
export {
  getAllProducts,
  getFeaturedProducts,
  createProduct,
  deleteProduct,
  getProductsByCategory,
  getProductById,
  toggleFeaturedProduct,
  searchProducts,
};
