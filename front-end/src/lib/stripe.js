import { loadStripe } from "@stripe/stripe-js";
import { validateStripePublishableKey } from "../../stripe-key-validation.js";

let stripePromise;

export const getStripeClient = () => {
  if (!stripePromise) {
    const key = validateStripePublishableKey(
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    );
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};
