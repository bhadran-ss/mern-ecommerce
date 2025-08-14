import Product from "../models/product.model.js";
import User from "../models/user.model.js";

const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    const existingitem = user.cartItems?.find(
      (item) => String(item._id) === String(productId)
    );
    if (existingitem) {
      existingitem.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }
    await user.save();
    res.status(201).json({
      success: true,
      message: existingitem ? "Quantity increased." : "Product added to cart.",
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
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
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
    console.log(
      "Cart Items IDs:",
      user.cartItems.map((i) => i._id.toString())
    );
    console.log("Product ID Param:", productId);

    const existingitem = user.cartItems.find(
      (item) => item._id.toString() === productId
    );

    console.log("existingitem", existingitem);

    if (existingitem) {
      if (quantity <= 0) {
        user.cartItems = user.cartItems.filter(
          (item) => item._id.toString() !== productId
        );
      } else {
        existingitem.quantity = quantity;
      }
      await user.save();
      return res.json(user.cartItems);
    } else {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }
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
    const products = await Product.find({ _id: { $in: req.user.cartItems } });
    //quantity
    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (item) => item._id.toString() === product._id.toString()
      );
      return {
        ...product.toJSON(),
        quantity: item ? item.quantity : 1,
      };
    });
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

export{
  addToCart,
  removeFromCart,
  updatequantity,
  getCart,
  clearCart,
};
