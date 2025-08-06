import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import * as cartController from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", protectRoute, cartController.getCart);
router.post("/", protectRoute, cartController.addToCart);
router.delete("/clear", protectRoute, cartController.clearCart);
router.delete("/:id", protectRoute, cartController.removeFromCart);
router.put("/:id", protectRoute, cartController.updatequantity);

export default router;
