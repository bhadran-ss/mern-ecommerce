import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { createCheckoutSession, checkoutSucess } from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/checkout', protectRoute, createCheckoutSession);
router.post('/success', protectRoute, checkoutSucess);

export default router;
