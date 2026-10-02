import {
  addProductToCart,
  clearUserCart,
  getUserCart,
  removeProductFromCart,
  updateCartProductQuantity,
} from "../services/cart.service.js";
import {
  validateCartProductId,
  validateCartQuantity,
} from "../validation/cart.validation.js";

const addToCart = async (req, res, next) => {
  try {
    const productId = validateCartProductId(req.body?.productId);
    const result = await addProductToCart(req.user, productId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const productId = validateCartProductId(req.params.id);
    const result = await removeProductFromCart(req.user, productId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const updateQuantity = async (req, res, next) => {
  try {
    const productId = validateCartProductId(req.params.id);
    const quantity = validateCartQuantity(req.body?.quantity);
    const result = await updateCartProductQuantity(
      req.user,
      productId,
      quantity,
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const getCart = async (req, res, next) => {
  try {
    const result = await getUserCart(req.user);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const result = await clearUserCart(req.user);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export { addToCart, removeFromCart, updateQuantity, getCart, clearCart };
