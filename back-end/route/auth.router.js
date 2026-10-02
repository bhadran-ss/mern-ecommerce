import express from "express";
import rateLimit from "express-rate-limit";
import authcontroller from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const createAuthRateLimit = (limit) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) =>
      res.status(429).json({
        error: {
          code: "AUTH_RATE_LIMITED",
          message: "Too many authentication attempts. Please try again later.",
        },
        requestId: req.id,
      }),
  });

const router = express.Router();

router.post("/signup", createAuthRateLimit(5), authcontroller.signup);
router.post("/login", createAuthRateLimit(10), authcontroller.login);
router.post("/logout", authcontroller.logout);
router.post("/refresh-token", authcontroller.refreshAccessToken);
router.get("/profile", protectRoute, authcontroller.profile);

export default router;
