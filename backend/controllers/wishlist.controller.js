import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

const wlFields = "_id name price category image stock";

export const addToWishlist = async (req, res) => {
  try {
    const pid = req.params.productId;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const prod = await Product.findById(pid).select("_id");
    if (!prod) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const wl = req.user.wishlist || [];

    if (wl.some((x) => x.toString() === pid)) {
      return res
        .status(409)
        .json({ success: false, message: "Product already in wishlist" });
    }

    wl.push(prod._id);
    req.user.wishlist = wl;
    await req.user.save();

    return res
      .status(201)
      .json({ success: true, message: "Product added to wishlist" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const cust = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: wlFields,
    });

    if (!cust) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    return res.status(200).json({
      success: true,
      count: cust.wishlist.length,
      wishlist: cust.wishlist,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const pid = req.params.productId;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const wl = req.user.wishlist || [];
    const idx = wl.findIndex((x) => x.toString() === pid);

    if (idx === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist",
      });
    }

    wl.splice(idx, 1);
    req.user.wishlist = wl;
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
