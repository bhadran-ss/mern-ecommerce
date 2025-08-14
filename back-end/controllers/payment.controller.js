import dotenv from "dotenv";
import stripe from "../lib/stripe.js";
import Order from "../models/order.model.js";

dotenv.config({ quiet: true });
const createCheckoutSession = async (req, res) => {
  const { cart } = req.body;
  if (!cart || cart.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
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
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      metadata: {
        userId: req.user ? req.user._id.toString() : "guest",
        cartItems: JSON.stringify(
          cart.map((item) => ({
            id: item._id || item.productId,
            qty: item.quantity,
          }))
        ),
      },
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Stripe error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to create session" });
  }
};
const checkoutSucess = async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required" });
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
        res.status(400).json({ error: "Payment not completed" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve session" });
    }
  }
};
export { createCheckoutSession, checkoutSucess };
