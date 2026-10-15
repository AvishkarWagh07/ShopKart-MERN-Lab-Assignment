import Razorpay from "razorpay";

export const createRazorpayInstance = () => {
  const key = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key || !secret) {
    throw new Error("Razorpay credentials are missing.");
  }

  console.log("making a razorpay instance");

  return new Razorpay({
    key_id: key,
    key_secret: secret,
  });
};
