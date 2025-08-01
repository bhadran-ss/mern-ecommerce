import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";

import "./lib/db.js";

import authRouter from "./route/auth.router.js";
import productRouter from "./route/product.router.js";
import cartRouter from "./route/cart.router.js";
import PaymentRouter from "./route/payment.router.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/payment", PaymentRouter);
app.get("/", (req, res) => {
  res.send("Server is working");
});

const frontEndPath = path.join(__dirname, 'front-end', 'dist');
app.use(express.static(frontEndPath));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "front-end", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
