import express from "express";
const router = express.Router();

import authcontroller from "../controllers/auth.controller.js"

import { protectRoute } from "../middleware/auth.middleware.js";

router.post("/signup", authcontroller.signup);
router.post("/login", authcontroller.login);
router.post("/logout", authcontroller.logout);
router.post("/refresh-token", authcontroller.refreshAccessToken);
router.get("/profile", protectRoute, authcontroller.profile);

export default router;
