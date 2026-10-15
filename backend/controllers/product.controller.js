import mongoose from "mongoose";
import Product from "../models/product.model.js";

const cardFields = "_id name price category image stock";

export const createProduct = async (req, res) => {
  try {
    const { name, description: desc, price, category, image, stock } = req.body;

    if (
      !name ||
      !desc ||
      price === undefined ||
      price === null ||
      price === "" ||
      !category ||
      !image ||
      stock === undefined ||
      stock === null ||
      stock === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const p = Number(price);
    const s = Number(stock);

    if (Number.isNaN(p) || p <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    if (Number.isNaN(s) || s < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    const prod = await Product.create({
      name,
      description: desc,
      price: p,
      category,
      image,
      stock: s,
    });
    console.log("product created:", prod.name);

    return res.status(201).json(prod);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { search, category: cat, sort } = req.query;
    const filter = {};

    if (search) {
      const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.name = { $regex: safe, $options: "i" };
    }

    if (cat) {
      filter.category = cat;
    }

    let sortBy = {};
    if (sort === "price_asc") {
      sortBy = { price: 1 };
    } else if (sort === "price_desc") {
      sortBy = { price: -1 };
    }

    const list = await Product.find(filter)
      .select(cardFields)
      .sort(sortBy);

    return res.status(200).json({
      success: true,
      count: list.length,
      products: list,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const pid = req.params.id;

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

    return res.status(200).json(prod);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
