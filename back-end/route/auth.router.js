import express from "express";

import authController from "../controllers/auth.controller.js";
import {
  loginRateLimit,
  refreshRateLimit,
  registrationRateLimit,
} from "../middleware/auth-rate-limit.js";
import { protectRoute } from "../middleware/auth.middleware.js";

export const createAuthRouter = ({
  controller = authController,
  registrationLimiter = registrationRateLimit,
  loginLimiter = loginRateLimit,
  refreshLimiter = refreshRateLimit,
  authentication = protectRoute,
} = {}) => {
  const router = express.Router();

  router.get("/csrf-token", controller.getCsrfToken);
  router.post("/signup", registrationLimiter, controller.signup);
  router.post("/login", loginLimiter, controller.login);
  router.post("/logout", controller.logout);
  router.post("/logout-all", authentication, controller.logoutAll);
  router.post("/refresh-token", refreshLimiter, controller.refreshAccessToken);
  router.get("/profile", authentication, controller.profile);

  return router;
};

export default createAuthRouter();
