import Product from "../models/product.model.js";
import { AppError } from "../utils/app-error.js";

const addToCart = async (req, res) => {
  const { productId } = req.body;
  const user = req.user;
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  }

  const existingItem = user.cartItems?.find(
    (item) => item.product.toString() === productId,
  );
  const nextQuantity = existingItem ? existingItem.quantity + 1 : 1;
  if (nextQuantity > product.stock) {
    throw new AppError(
      400,
      "INSUFFICIENT_STOCK",
      "Cannot add more than available stock.",
    );
  }

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    user.cartItems.push({ product: productId, quantity: 1 });
  }

  await user.save();
  res.status(201).json({
    success: true,
    message: existingItem ? "Quantity increased." : "Product added to cart.",
  });
};

const removeFromCart = async (req, res) => {
  const { id: productId } = req.params;
  const user = req.user;

  if (!productId) {
    user.cartItems = [];
  } else {
    user.cartItems = user.cartItems.filter(
      (item) => item.product.toString() !== productId,
    );
  }

  await user.save();
  res.json(user.cartItems);
};

const updatequantity = async (req, res) => {
  const { id: productId } = req.params;
  const { quantity } = req.body;
  const user = req.user;
  const existingItem = user.cartItems.find(
    (item) => item.product.toString() === productId,
  );

  if (!existingItem) {
    throw new AppError(404, "CART_ITEM_NOT_FOUND", "Item not found in cart.");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  }
  if (quantity > product.stock) {
    throw new AppError(
      400,
      "INSUFFICIENT_STOCK",
      "Cannot set quantity above available stock.",
    );
  }

  if (quantity <= 0) {
    user.cartItems = user.cartItems.filter(
      (item) => item.product.toString() !== productId,
    );
  } else {
    existingItem.quantity = quantity;
  }

  await user.save();
  res.json(user.cartItems);
};

const getCart = async (req, res) => {
  await req.user.populate("cartItems.product");
  const cartItems = req.user.cartItems
    .map((item) => {
      if (!item.product) return null;
      return {
        ...item.product.toJSON(),
        quantity: item.quantity,
      };
    })
    .filter(Boolean);

  res.json(cartItems);
};

const clearCart = async (req, res) => {
  const user = req.user;
  if (!user || !Array.isArray(user.cartItems)) {
    throw new AppError(400, "INVALID_CART", "Invalid user or cart.");
  }

  user.cartItems = [];
  await user.save();
  res.status(200).json({ message: "Cart cleared successfully." });
};

export { addToCart, removeFromCart, updatequantity, getCart, clearCart };
