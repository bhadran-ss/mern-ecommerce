import mongoose from "mongoose";
import { ApiError } from "../middleware/errors.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import StripeWebhookEvent from "../models/stripeWebhookEvent.model.js";
import User from "../models/user.model.js";
import { validateCheckoutSessionForFulfillment } from "../validation/fulfillment.validation.js";

export const fulfillCheckoutSession = async ({ event, session, lineItems }) => {
  if (!event?.id || !event.type || session?.id !== event.data?.object?.id) {
    throw new ApiError(
      400,
      "INVALID_CHECKOUT_SESSION",
      "The checkout session could not be verified.",
    );
  }

  const verifiedCheckout = validateCheckoutSessionForFulfillment(
    session,
    lineItems,
  );
  const mongoSession = await mongoose.startSession();

  try {
    await mongoSession.withTransaction(
      async () => {
        const processedEvent = await StripeWebhookEvent.findOne({
          eventId: event.id,
        }).session(mongoSession);
        if (processedEvent) {
          return;
        }

        await StripeWebhookEvent.create(
          [
            {
              eventId: event.id,
              type: event.type,
              checkoutSessionId: session.id,
            },
          ],
          { session: mongoSession },
        );

        const existingOrder = await Order.findOne({
          stripeSessionId: session.id,
        }).session(mongoSession);
        if (existingOrder) {
          return;
        }

        for (const item of verifiedCheckout.products) {
          const product = await Product.findOneAndUpdate(
            {
              _id: item.productId,
              stock: { $gte: item.quantity },
            },
            { $inc: { stock: -item.quantity } },
            { session: mongoSession },
          );

          if (!product) {
            throw new ApiError(
              409,
              "INSUFFICIENT_STOCK",
              "A product no longer has enough stock to fulfil this order.",
            );
          }
        }

        await Order.create(
          [
            {
              user: verifiedCheckout.userId,
              products: verifiedCheckout.products.map((item) => ({
                product: item.productId,
                quantity: item.quantity,
                productName: item.productName,
                unitAmountMinorUnits: item.unitAmountMinorUnits,
              })),
              totalAmount: verifiedCheckout.totalAmountMinorUnits / 100,
              totalAmountMinorUnits: verifiedCheckout.totalAmountMinorUnits,
              currency: "inr",
              status: "Completed",
              stripeSessionId: session.id,
            },
          ],
          { session: mongoSession },
        );

        await User.updateOne(
          { _id: verifiedCheckout.userId },
          {
            $pull: {
              cartItems: {
                $or: verifiedCheckout.products.map((item) => ({
                  product: new mongoose.Types.ObjectId(item.productId),
                  quantity: item.quantity,
                })),
              },
            },
          },
          { session: mongoSession },
        );
      },
      {
        readPreference: "primary",
        readConcern: { level: "snapshot" },
        writeConcern: { w: "majority" },
      },
    );
  } catch (error) {
    if (error?.code === 11000) {
      const [processedEvent, existingOrder] = await Promise.all([
        StripeWebhookEvent.exists({ eventId: event.id }),
        Order.exists({ stripeSessionId: session.id }),
      ]);
      if (processedEvent || existingOrder) {
        return;
      }
    }
    throw error;
  } finally {
    await mongoSession.endSession();
  }
};
