import Product from "../models/product.model.js";

const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const existingItem = user.cartItems?.find(
      (item) => item.product.toString() === productId,
    );
    const nextQuantity = existingItem ? existingItem.quantity + 1 : 1;

    if (nextQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Cannot add more than available stock.",
      });
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
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const updatequantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId,
    );

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Cannot set quantity above available stock.",
      });
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const getCart = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !Array.isArray(user.cartItems)) {
      return res.status(400).json({ message: "Invalid user or cart." });
    }

    user.cartItems = [];
    await user.save();
    res.status(200).json({ message: "Cart cleared successfully." });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Failed to clear cart." });
  }
};

export { addToCart, removeFromCart, updatequantity, getCart, clearCart };
