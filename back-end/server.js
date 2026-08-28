import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { getConfig } from "./config/env.js";
import "./lib/db.js";
import authRouter from "./route/auth.router.js";
import productRouter from "./route/product.router.js";
import cartRouter from "./route/cart.router.js";
import PaymentRouter from "./route/payment.router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const config = getConfig();

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/payment", PaymentRouter);

// Serve frontend in production
if (config.nodeEnv === "production") {
  const frontendPath = path.join(__dirname, "../front-end/dist");
  app.use(express.static(frontendPath));
 app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

} else {
  app.get("/", (req, res) => {
    res.send("Server is working (development mode)");
  });
}

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
