import path from "path";
import { fileURLToPath } from "url";

import config from "./config/env.js";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectDB from "./lib/db.js";
import authRouter from "./route/auth.router.js";
import productRouter from "./route/product.router.js";
import cartRouter from "./route/cart.router.js";
import PaymentRouter from "./route/payment.router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = config.PORT;

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
  })
);

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/payment", PaymentRouter);

// Serve frontend in production
if (config.NODE_ENV === "production") {
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

const startServer = async () => {
  try {
    await connectDB();
    console.log("Connection created in db...");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch {
    console.error("Database connection failed. Server was not started.");
    process.exitCode = 1;
  }
};

startServer();
