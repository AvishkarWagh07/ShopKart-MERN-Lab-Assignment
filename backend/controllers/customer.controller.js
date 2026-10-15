import bcrypt from "bcrypt";
import Customer from "../models/customer.model.js";
import generateToken from "../utils/generateToken.js";

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  path: "/",
};

export const register = async (req, res) => {
  try {
    const { fullName, email, password: pwd, phone } = req.body;

    if (!fullName || !email || !pwd || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (pwd.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const taken = await Customer.findOne({ email });
    if (taken) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashed = await bcrypt.hash(pwd, 10);

    const cust = await Customer.create({
      fullName,
      email,
      password: hashed,
      phone,
    });

    console.log("new customer registered:", email);

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        _id: cust._id,
        fullName: cust.fullName,
        email: cust.email,
        phone: cust.phone,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cust = await Customer.findOne({ email });
    if (!cust) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const ok = await bcrypt.compare(password, cust.password);
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(cust._id);

    res.cookie("token", token, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    console.log("login ok for", email);

    return res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getMe = (req, res) => {
  return res.status(200).json({
    _id: req.user._id,
    fullName: req.user.fullName,
    email: req.user.email,
    phone: req.user.phone,
  });
};

export const logout = (req, res) => {
  res.clearCookie("token", cookieOpts);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const hi = (req, res) => {
  return res.status(200).json({
    message: "Hello!",
  });
}
