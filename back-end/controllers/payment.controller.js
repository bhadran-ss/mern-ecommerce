import stripe from "../lib/stripe.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { ApiError } from "../middleware/errors.js";
import { createTestCheckoutSession } from "../services/checkout.service.js";
import { validateCheckoutIdempotencyKey } from "../validation/checkout.validation.js";

const createCheckoutSession = async (req, res, next) => {
  try {
    const idempotencyKey = validateCheckoutIdempotencyKey(
      req.get("Idempotency-Key"),
    );
    const result = await createTestCheckoutSession({
      user: req.user,
      idempotencyKey,
    });
    return res.status(200).json(result);
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
