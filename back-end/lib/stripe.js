import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;
