import Product from "../models/product.model.js";
import { ApiError } from "../middleware/errors.js";

const getCartProductId = (product) =>
  product?._id?.toString() || product?.toString() || "";

const getAuthoritativeCart = async (user) => {
  const storedItems = user.cartItems.map((item) => ({
    productId: getCartProductId(item.product),
    quantity: item.quantity,
  }));
  await user.populate("cartItems.product");

  const normalizedByProduct = new Map();
  const unavailableItems = [];

  user.cartItems.forEach((item, index) => {
    const stored = storedItems[index];
    const product = item.product;
    if (!product) {
      unavailableItems.push({ productId: stored.productId, reason: "removed" });
      return;
    }

    if (!Number.isSafeInteger(stored.quantity) || stored.quantity < 1) {
      unavailableItems.push({
        productId: product._id.toString(),
        name: product.name,
        reason: "invalid_quantity",
      });
      return;
    }

    if (!Number.isSafeInteger(product.stock) || product.stock < 1) {
      unavailableItems.push({
        productId: product._id.toString(),
        name: product.name,
        reason: "out_of_stock",
      });
      return;
    }

    const productId = product._id.toString();
    const previous = normalizedByProduct.get(productId);
    const combinedQuantity = (previous?.quantity || 0) + stored.quantity;
    const quantity = Math.min(combinedQuantity, product.stock);

    if (previous || quantity !== stored.quantity) {
      unavailableItems.push({
        productId,
        name: product.name,
        reason: "stock_changed",
      });
    }

    normalizedByProduct.set(productId, { product, quantity });
  });

  const normalizedItems = [...normalizedByProduct.values()];
  const normalizedCartItems = normalizedItems.map(({ product, quantity }) => ({
    product: product._id,
    quantity,
  }));
  const hasChanges =
    normalizedCartItems.length !== storedItems.length ||
    normalizedCartItems.some((item, index) => {
      const stored = storedItems[index];
      return (
        !stored ||
        getCartProductId(item.product) !== stored.productId ||
        item.quantity !== stored.quantity
      );
    });

  if (hasChanges) {
    user.cartItems = normalizedCartItems;
    await user.save();
  }

  const cart = normalizedItems.map(({ product, quantity }) => ({
    ...product.toJSON(),
    quantity,
  }));
  return { cart, unavailableItems };
};

const createCartResult = async (
  user,
  message,
  additionalUnavailableItems = [],
) => {
  const { cart, unavailableItems } = await getAuthoritativeCart(user);
  return {
    cart,
    unavailableItems: [...additionalUnavailableItems, ...unavailableItems],
    ...(message && { message }),
  };
};

export const addProductToCart = async (user, productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  }

  const canonicalProductId = product._id.toString();
  const existingItem = user.cartItems.find(
    (item) => getCartProductId(item.product) === canonicalProductId,
  );
  const currentQuantity = existingItem?.quantity || 0;
  if (
    existingItem &&
    (!Number.isSafeInteger(currentQuantity) || currentQuantity < 1)
  ) {
    throw new ApiError(409, "INVALID_CART", "Cart quantity is invalid.");
  }

  const nextQuantity = currentQuantity + 1;
  if (!Number.isSafeInteger(product.stock) || nextQuantity > product.stock) {
    throw new ApiError(
      409,
      "INSUFFICIENT_STOCK",
      "The requested quantity is not available in stock.",
    );
  }

  if (existingItem) {
    existingItem.quantity = nextQuantity;
  } else {
    user.cartItems.push({ product: product._id, quantity: 1 });
  }

  await user.save();
  return createCartResult(
    user,
    existingItem ? "Quantity increased." : "Product added to cart.",
  );
};

export const removeProductFromCart = async (user, productId) => {
  user.cartItems = user.cartItems.filter(
    (item) => getCartProductId(item.product) !== productId,
  );
  await user.save();
  return createCartResult(user, "Product removed from cart.");
};

export const updateCartProductQuantity = async (user, productId, quantity) => {
  const existingItem = user.cartItems.find(
    (item) => getCartProductId(item.product) === productId,
  );
  if (!existingItem) {
    throw new ApiError(404, "CART_ITEM_NOT_FOUND", "Item not found in cart.");
  }

  const product = await Product.findById(productId);
  if (!product) {
    user.cartItems = user.cartItems.filter(
      (item) => getCartProductId(item.product) !== productId,
    );
    await user.save();
    return createCartResult(
      user,
      "Unavailable product was removed from cart.",
      [{ productId, reason: "removed" }],
    );
  }

  if (!Number.isSafeInteger(product.stock) || quantity > product.stock) {
    throw new ApiError(
      409,
      "INSUFFICIENT_STOCK",
      "The requested quantity is not available in stock.",
    );
  }

  existingItem.quantity = quantity;
  await user.save();
  return createCartResult(user, "Cart quantity updated.");
};

export const getUserCart = (user) => createCartResult(user);

export const clearUserCart = async (user) => {
  user.cartItems = [];
  await user.save();
  return createCartResult(user, "Cart cleared successfully.");
};
