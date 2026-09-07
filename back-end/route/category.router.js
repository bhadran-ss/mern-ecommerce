import express from "express";
import {
  createCategory,
  deactivateCategory,
  getAdminCategories,
  getCategories,
  getProductsForCategory,
} from "../controllers/category.controller.js";
import { authorize } from "../middleware/authorize.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/products/:slug", getProductsForCategory);
router.get("/admin", protectRoute, authorize("admin"), getAdminCategories);
router.post("/", protectRoute, authorize("admin"), createCategory);
router.delete("/:id", protectRoute, authorize("admin"), deactivateCategory);

export default router;
