import express from "express";

import authController from "../controllers/auth.controller.js";
import {
  loginRateLimit,
  registrationRateLimit,
} from "../middleware/auth-rate-limit.js";
import { protectRoute } from "../middleware/auth.middleware.js";

export const createAuthRouter = ({
  controller = authController,
  registrationLimiter = registrationRateLimit,
  loginLimiter = loginRateLimit,
} = {}) => {
  const router = express.Router();

  router.post("/signup", registrationLimiter, controller.signup);
  router.post("/login", loginLimiter, controller.login);
  router.post("/logout", controller.logout);
  router.post("/refresh-token", controller.refreshAccessToken);
  router.get("/profile", protectRoute, controller.profile);

  return router;
};

export default createAuthRouter();
