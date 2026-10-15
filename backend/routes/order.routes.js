import express from "express";
import {
  createPaymentOrder,
  getOrderById,
  getOrders,
  verifyPayment,
} from "../controllers/order.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const r = express.Router();

// every order route is behind login
r.use(protect);
r.post("/", createPaymentOrder);
r.post("/create-payment-order", createPaymentOrder);
r.post("/verify-payment", verifyPayment);
r.get("/", getOrders);
r.get("/:id", getOrderById);

export default r;
