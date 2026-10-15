import crypto from "crypto";
import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { createRazorpayInstance } from "../config/razorpay.js";

const cleanAddress = (addr = {}) => ({
  fullName: String(addr.fullName || "").trim(),
  phone: String(addr.phone || "").trim(),
  addressLine1: String(addr.addressLine1 || "").trim(),
  city: String(addr.city || "").trim(),
  state: String(addr.state || "").trim(),
  pincode: String(addr.pincode || "").trim(),
});

const checkAddress = (addr = {}) => {
  const cleaned = cleanAddress(addr);
  const reqFields = [
    ["fullName", "Full Name"],
    ["phone", "Phone number"],
    ["addressLine1", "Address"],
    ["city", "City"],
    ["state", "State"],
    ["pincode", "Pincode"],
  ];

  for (const [key, label] of reqFields) {
    if (!cleaned[key]) {
      return {
        valid: false,
        message: `${label} is required.`,
      };
    }
  }

  if (!/^[0-9+\-\s()]{10,15}$/.test(cleaned.phone)) {
    return {
      valid: false,
      message: "Phone number is invalid.",
    };
  }

  if (!/^\d{6}$/.test(cleaned.pincode)) {
    return {
      valid: false,
      message: "Pincode must contain 6 digits.",
    };
  }

  return {
    valid: true,
    payload: cleaned,
  };
};

const buildSnapshot = (cart, prodMap) => {
  const list = [];
  let total = 0;

  for (const row of cart) {
    const pid = row.product?.toString();
    const prod = prodMap.get(pid);
    const qty = Number(row.quantity || 0);

    if (!prod) {
      throw new Error("One or more products in your cart are no longer available.");
    }

    if (!Number.isInteger(qty) || qty < 1) {
      throw new Error(`Invalid quantity for ${prod.name}.`);
    }

    if (qty > Number(prod.stock || 0)) {
      throw new Error(`Insufficient stock for ${prod.name}.`);
    }

    const price = Number(prod.price || 0);
    list.push({
      product: prod._id,
      name: prod.name,
      price,
      quantity: qty,
      image: prod.image,
    });
    total += price * qty;
  }

  return { items: list, totalAmount: total };
};

const isBadInput = (msg = "") =>
  /Cart is empty|Insufficient stock|no longer available|Invalid shipping|Pincode must contain 6 digits|Phone number is invalid|One or more products|required\.|is required/i.test(msg);

export const createPaymentOrder = async (req, res) => {
  try {
    const addr = req.body.shippingAddress || req.body;
    const check = checkAddress(addr);

    if (!check.valid) {
      return res.status(400).json({
        success: false,
        message: check.message,
      });
    }

    const cust = await Customer.findById(req.user._id);
    const cart = Array.isArray(cust?.cart) ? cust.cart : [];

    // small check so empty cart dont go ahead
    if (cart.length === 0) {
      throw new Error("Cart is empty.");
    }

    const ids = cart.map((row) => row.product);
    const products = await Product.find({ _id: { $in: ids } });
    const prodMap = new Map(products.map((p) => [p._id.toString(), p]));

    const { items, totalAmount } = buildSnapshot(cart, prodMap);
    const rzp = createRazorpayInstance();

    const ord = await Order.create({
      user: cust._id,
      items,
      shippingAddress: check.payload,
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    let rzpOrder;
    try {
      rzpOrder = await rzp.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: String(ord._id),
        notes: {
          shopkartOrderId: String(ord._id),
        },
      });
    } catch (err) {
      await Order.deleteOne({ _id: ord._id });
      console.error("Razorpay order creation failed:", err.message);
      return res.status(502).json({
        success: false,
        message:
          "Razorpay could not create the payment order. Check the backend Test Mode credentials and try again.",
      });
    }

    ord.razorpayOrderId = rzpOrder.id;
    await ord.save();
    console.log("payment order created:", ord._id);

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully.",
      order: ord,
      shopkartOrderId: ord._id,
      razorpay: {
        key: process.env.RAZORPAY_KEY_ID,
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
      },
    });
  } catch (err) {
    const msg = err.message || "Unable to create payment order.";

    if (msg === "Razorpay credentials are missing.") {
      return res.status(503).json({
        success: false,
        message:
          "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env using Test Mode keys, then restart the backend.",
      });
    }

    if (isBadInput(msg)) {
      return res.status(400).json({
        success: false,
        message: msg,
      });
    }

    console.error("Payment order creation failed:", msg);
    return res.status(500).json({
      success: false,
      message: "Unable to create payment order.",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      orderId: oid,
      razorpayOrderId: rzpOid,
      razorpayPaymentId: rzpPayId,
      razorpaySignature: sig,
    } = req.body;

    if (!oid || !rzpOid || !rzpPayId || !sig) {
      return res.status(400).json({
        success: false,
        message: "Payment verification data is incomplete.",
      });
    }

    const ord = await Order.findOne({
      _id: oid,
      user: req.user._id,
    });

    if (!ord) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const mySig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${rzpOid}|${rzpPayId}`)
      .digest("hex");

    if (mySig !== sig) {
      ord.paymentStatus = "FAILED";
      ord.status = "PENDING_PAYMENT";
      await ord.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Your cart has not been cleared.",
      });
    }

    if (ord.razorpayOrderId !== rzpOid) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order id does not match this order.",
      });
    }

    ord.razorpayPaymentId = rzpPayId;
    ord.razorpaySignature = sig;
    ord.paymentStatus = "PAID";
    ord.status = "PLACED";
    await ord.save();

    const cust = await Customer.findById(req.user._id);
    cust.cart = [];
    await cust.save();
    console.log("payment verified for order", ord._id);

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      order: ord,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to verify payment.",
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const list = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      orders: list,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to load orders.",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const oid = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(oid)) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const ord = await Order.findOne({
      _id: oid,
      user: req.user._id,
    }).lean();

    if (!ord) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      order: ord,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to load order.",
    });
  }
};
