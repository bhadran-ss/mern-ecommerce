import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors from "cors";

import "./lib/db.js";
import authRouter from "./route/auth.router.js";
import productRouter from "./route/product.router.js";
import cartRouter from "./route/cart.router.js";
import PaymentRouter from "./route/payment.router.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://mern-ecommerce-frontend-psi-ten.vercel.app"
  ],
  credentials: true
}));


// Routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/payment", PaymentRouter);

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
