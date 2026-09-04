import express from "express";
import {
  getSellerApplication,
  listPendingSellerApplications,
  reviewSellerApplication,
  submitSellerApplication,
} from "../controllers/seller-application.controller.js";
import { authorize } from "../middleware/authorize.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);
router.get("/mine", getSellerApplication);
router.post("/", submitSellerApplication);
router.get("/", authorize("admin"), listPendingSellerApplications);
router.patch("/:userId/review", authorize("admin"), reviewSellerApplication);

export default router;
