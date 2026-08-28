import Stripe from "stripe";
import { getConfig } from "../config/env.js";

const { secretKey } = getConfig().stripe;

const stripe = new Stripe(secretKey);

export default stripe;
