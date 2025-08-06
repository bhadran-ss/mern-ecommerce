import express from "express";
import * as productController from "../controllers/product.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/category/:category", productController.getProductsByCategory);
router.get("/:id", productController.getProductById);

router.post("/", protectRoute, adminRoute, productController.createProduct);
router.patch(
  "/:id",
  protectRoute,
  adminRoute,
  productController.toggleFeaturedProduct
);
router.delete(
  "/:id",
  protectRoute,
  adminRoute,
  productController.deleteProduct
);

export default router;
