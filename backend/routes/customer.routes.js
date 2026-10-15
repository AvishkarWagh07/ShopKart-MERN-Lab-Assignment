import express from "express";
import {
  register,
  login,
  getMe,
  logout,
  hi,
} from "../controllers/customer.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const r = express.Router();

r.post("/register", register);
r.post("/login", login);
r.get("/me", protect, getMe);
r.post("/logout", protect, logout);
r.get("/hi", hi);

export default r;
