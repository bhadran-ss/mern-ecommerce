import stripe from "../lib/stripe.js";
import Order from "../models/order.model.js";
import config from "../config/env.js";
import { ApiError } from "../middleware/errors.js";
import { createTestCheckoutSession } from "../services/checkout.service.js";
import { fulfillCheckoutSession } from "../services/fulfillment.service.js";
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
const checkoutSuccess = async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    if (
      typeof sessionId !== "string" ||
      !/^cs_test_[A-Za-z0-9]+$/.test(sessionId) ||
      sessionId.length > 255
    ) {
      return next(
        new ApiError(400, "VALIDATION_ERROR", "A valid session ID is required."),
      );
    }

    const order = await Order.findOne({
      stripeSessionId: sessionId,
      user: req.user._id,
    }).select("_id");

    if (!order) {
      return res.status(202).json({ status: "processing" });
    }

    return res.status(200).json({
      status: "fulfilled",
      orderId: order._id,
    });
  } catch (error) {
    return next(error);
  }
};

const handleStripeWebhook = async (req, res, next) => {
  const signature = req.get("stripe-signature");
  if (!Buffer.isBuffer(req.body) || !signature) {
    return next(
      new ApiError(400, "INVALID_WEBHOOK", "Invalid webhook signature."),
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      config.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return next(new ApiError(400, "INVALID_WEBHOOK", "Invalid webhook signature."));
  }

  try {
    if (
      event.type !== "checkout.session.completed" &&
      event.type !== "checkout.session.async_payment_succeeded"
    ) {
      return res.status(200).json({ received: true });
    }

    const eventSession = event.data?.object;
    if (eventSession?.object !== "checkout.session" || !eventSession.id) {
      return next(
        new ApiError(400, "INVALID_WEBHOOK", "Invalid checkout session event."),
      );
    }

    if (
      event.type === "checkout.session.completed" &&
      eventSession.payment_status !== "paid"
    ) {
      return res.status(200).json({ received: true });
    }

    const session = await stripe.checkout.sessions.retrieve(eventSession.id);
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
    });
    await fulfillCheckoutSession({ event, session, lineItems });

    return res.status(200).json({ received: true });
  } catch (error) {
    return next(error);
  }
};

export { createCheckoutSession, checkoutSuccess, handleStripeWebhook };
