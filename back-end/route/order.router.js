import express from "express";
import { getOrderById, getOrders } from "../controllers/order.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);
router.get("/", getOrders);
router.get("/:orderId", getOrderById);

export default router;
