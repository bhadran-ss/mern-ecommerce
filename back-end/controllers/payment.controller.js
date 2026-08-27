import config from "../config/env.js";
import stripe from "../lib/stripe.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { ApiError } from "../middleware/errors.js";

const createCheckoutSession = async (req, res, next) => {
  const { cart } = req.body;
  if (!cart || cart.length === 0) {
    return next(new ApiError(400, "INVALID_CART", "Cart is empty."));
  }

  const productIds = cart.map((item) => item._id || item.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  for (const item of cart) {
    const product = products.find(
      (productItem) =>
        productItem._id.toString() === (item._id || item.productId).toString(),
    );
    if (!product) {
      return next(new ApiError(400, "PRODUCT_NOT_FOUND", "A cart product was not found."));
    }
    if (item.quantity > product.stock) {
      return next(new ApiError(400, "INSUFFICIENT_STOCK", "A cart product has insufficient stock."));
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: cart.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      success_url: `${config.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.CLIENT_URL}/purchase-cancel`,
      metadata: {
        userId: req.user ? req.user._id.toString() : "guest",
        cartItems: JSON.stringify(
          cart.map((item) => ({
            id: item._id || item.productId,
            qty: item.quantity,
          })),
        ),
      },
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    return next(error);
  }
};
const checkoutSucess = async (req, res, next) => {
  const { sessionId } = req.query;
  if (!sessionId) {
    return next(new ApiError(400, "VALIDATION_ERROR", "Session ID is required."));
  }
  const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
  if (existingOrder) {
    return res.status(200).json({
      message: "Order already exists",
      orderId: existingOrder._id,
    });
  } else {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        const products = JSON.parse(session.metadata.cartItems || "[]");

        for (const item of products) {
          const updateResult = await Product.updateOne(
            {
              _id: item.id,
              stock: { $gte: item.qty },
            },
            { $inc: { stock: -item.qty } },
          );
          if (updateResult.modifiedCount === 0) {
            return next(new ApiError(400, "INSUFFICIENT_STOCK", "A product no longer has enough stock."));
          }
        }

        const newOrder = Order({
          user: session.metadata.userId || null,
          products: products.map((item) => ({
            product: item.id,
            quantity: item.qty,
          })),
          totalAmount: session.amount_total / 100,
          status: "Completed",
          stripeSessionId: session.id,
        });
        await newOrder.save();
        res.status(200).json({
          message: "Order created successfully",
          orderId: newOrder._id,
        });
      } else {
        return next(new ApiError(400, "PAYMENT_INCOMPLETE", "Payment is not complete."));
      }
    } catch (error) {
      return next(error);
    }
  }
};
export { createCheckoutSession, checkoutSucess };
