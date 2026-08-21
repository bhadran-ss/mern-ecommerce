import Stripe from "stripe";

let stripeClient;

export const initializeStripe = (secretKey) => {
  stripeClient = new Stripe(secretKey);
  return stripeClient;
};

export const getStripeClient = () => {
  if (!stripeClient) {
    throw new Error("Stripe has not been initialized.");
  }
  return stripeClient;
};
