import jwt from "jsonwebtoken";

// make a token that stays valid for 7 days
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export default generateToken;
