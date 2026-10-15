import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItemQuantity,
} from "../controllers/cart.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const r = express.Router();

// all cart routes need the user logged in
r.use(protect);
r.get("/", getCart);
r.post("/:productId", addToCart);
r.patch("/:productId", updateCartItemQuantity);
r.delete("/:productId", removeFromCart);

export default r;
