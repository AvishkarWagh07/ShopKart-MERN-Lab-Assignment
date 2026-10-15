import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

export const protect = async (req, res, next) => {
  try {
    // token is stored in the cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const cust = await Customer.findById(payload.id).select("-password");

    if (!cust) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    req.user = cust;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }
};
