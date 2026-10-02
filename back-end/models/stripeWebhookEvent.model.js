import mongoose from "mongoose";

const stripeWebhookEventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
  },
  checkoutSessionId: {
    type: String,
    required: true,
  },
  processedAt: {
    type: Date,
    default: Date.now,
  },
});

const StripeWebhookEvent = mongoose.model(
  "StripeWebhookEvent",
  stripeWebhookEventSchema,
);

export default StripeWebhookEvent;
