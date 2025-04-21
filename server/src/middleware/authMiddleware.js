import jwt from "jsonwebtoken";
import { asyncHandler } from "./errorMiddleware.js";
import { AppError } from "./errorMiddleware.js";
import User from "../models/userModel.js";

// Protect routes - verify token
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        throw new AppError("User not found", 401);
      }

      next();
    } catch (error) {
      console.error(error);
      throw new AppError("Not authorized, token failed", 401);
    }
  }

  if (!token) {
    throw new AppError("Not authorized, no token", 401);
  }
});
