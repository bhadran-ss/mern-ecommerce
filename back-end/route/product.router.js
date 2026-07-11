import express from "express";
import * as productController from "../controllers/product.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/category/:category", productController.getProductsByCategory);
router.get("/:id", productController.getProductById);

router.post(
  "/",
  protectRoute,
  authorize("seller", "admin"),
  productController.createProduct
);
router.patch(
  "/:id",
  protectRoute,
  authorize("seller", "admin"),
  productController.updateProduct
);
router.patch(
  "/:id/feature",
  protectRoute,
  authorize("admin"),
  productController.toggleFeaturedProduct
);
router.delete(
  "/:id",
  protectRoute,
  authorize("seller", "admin"),
  productController.deleteProduct
);

export default router;
