import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// only these fields needed on the client
const cartFields = "_id name price category image stock";

const loadCart = async (cid) => {
  return Customer.findById(cid).populate({
    path: "cart.product",
    select: cartFields,
  });
};

export const getCart = async (req, res) => {
  try {
    // grab the customer from the token id
    const cust = await loadCart(req.user._id);

    return res.status(200).json({
      success: true,
      cart: cust?.cart || [],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to load cart",
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const pid = req.params.productId;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const prod = await Product.findById(pid);
    if (!prod) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const cart = Array.isArray(req.user.cart) ? [...req.user.cart] : [];
    const found = cart.find(
      (it) => it.product && it.product.toString() === pid,
    );

    if (found) {
      const newQty = found.quantity + 1;

      if (newQty > prod.stock) {
        return res.status(400).json({
          success: false,
          message: "Requested quantity exceeds available stock",
        });
      }

      found.quantity = newQty;
    } else {
      if (prod.stock < 1) {
        return res.status(400).json({
          success: false,
          message: "Product is out of stock",
        });
      }

      cart.push({
        product: prod._id,
        quantity: 1,
      });
    }

    req.user.cart = cart;
    await req.user.save();

    const fresh = await loadCart(req.user._id);
    console.log("cart updated for", req.user._id);

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: fresh?.cart || [],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to update cart",
    });
  }
};

export const updateCartItemQuantity = async (req, res) => {
  try {
    const pid = req.params.productId;
    const qty = req.body.quantity;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // qty has to be a whole number and atleast 1
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const prod = await Product.findById(pid);
    if (!prod) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const cart = Array.isArray(req.user.cart) ? [...req.user.cart] : [];
    const found = cart.find(
      (it) => it.product && it.product.toString() === pid,
    );

    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    if (qty > prod.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
      });
    }

    found.quantity = qty;
    req.user.cart = cart;
    await req.user.save();

    const fresh = await loadCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: fresh?.cart || [],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to update cart",
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const pid = req.params.productId;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const cart = Array.isArray(req.user.cart) ? [...req.user.cart] : [];
    const idx = cart.findIndex(
      (it) => it.product && it.product.toString() === pid,
    );

    if (idx === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    cart.splice(idx, 1);
    req.user.cart = cart;
    await req.user.save();
    console.log("removed from cart ->", pid);

    const fresh = await loadCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: fresh?.cart || [],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to remove product from cart",
    });
  }
};
