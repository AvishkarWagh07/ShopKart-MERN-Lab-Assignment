import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
} from "../controllers/product.controller.js";

const r = express.Router();

r.post("/", createProduct);
r.get("/", getProducts);
r.get("/:id", getProductById);

export default r;
