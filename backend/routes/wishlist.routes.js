import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const r = express.Router();

// wishlist needs a logged in user
r.use(protect);
r.get("/", getWishlist);
r.post("/:productId", addToWishlist);
r.delete("/:productId", removeFromWishlist);

export default r;
