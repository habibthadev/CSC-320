import crypto from "crypto";
import User from "../models/user.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";
import {
  generateToken,
  verifyToken,
  invalidateUserTokens,
} from "../middleware/auth.middleware.js";
import { generateTokens, generateRefreshToken } from "../utils/token-utils.js";
import {
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../utils/email-service.js";
import logger from "../utils/logger.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError("All fields are required", 400);
  }

  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Please provide a valid email", 400);
  }

  const userExists = await User.findOne({ email: email.toLowerCase() });

  if (userExists) {
    throw new AppError("User already exists with this email", 400);
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password,
  });

  if (user) {
    try {
      await sendWelcomeEmail(email, name);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }

    const { accessToken, refreshToken } = generateTokens(
      user._id,
      user.tokenVersion || 0
    );

    logger.info(
      { userId: user._id, email: user.email },
      "User registered successfully"
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: accessToken,
        refreshToken: refreshToken,
        createdAt: user.createdAt,
      },
    });
  } else {
    throw new AppError("Failed to create user", 400);
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  if (!user || !(await user.matchPassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  user.lastLogin = new Date();
  await user.save();

  const { accessToken, refreshToken } = generateTokens(
    user._id,
    user.tokenVersion || 0
  );

  logger.info(
    { userId: user._id, email: user.email },
    "User logged in successfully"
  );

  res.json({
    success: true,
    message: "Login successful",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: accessToken,
      refreshToken: refreshToken,
      lastLogin: user.lastLogin,
    },
  });
});

export const logoutUser = asyncHandler(async (req, res) => {
  await invalidateUserTokens(req.user._id);

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    },
  });
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (email && email !== user.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("Please provide a valid email", 400);
    }

    const emailExists = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: user._id },
    });

    if (emailExists) {
      throw new AppError("Email already in use", 400);
    }

    user.email = email.toLowerCase();
  }

  if (name && name.trim() !== user.name) {
    user.name = name.trim();
  }

  if (newPassword) {
    if (!currentPassword) {
      throw new AppError(
        "Current password is required to set new password",
        400
      );
    }

    if (!(await user.matchPassword(currentPassword))) {
      throw new AppError("Current password is incorrect", 400);
    }

    if (newPassword.length < 6) {
      throw new AppError("New password must be at least 6 characters", 400);
    }

    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
  }

  await user.save();

  const token = generateToken(user._id, user.tokenVersion || 0);

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: newPassword ? token : undefined,
    },
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new AppError("No account found with this email address", 404);
  }

  const resetOTP = user.generateResetOTP();
  await user.save();

  try {
    await sendPasswordResetEmail(user.email, resetOTP, user.name);

    res.json({
      success: true,
      message: "Password reset OTP sent to your email",
      email: user.email,
    });
  } catch (error) {
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    await user.save();

    console.error("Password reset email error:", error);
    throw new AppError("Failed to send reset email. Please try again.", 500);
  }
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError("Email and OTP are required", 400);
  }

  const resetPasswordOTP = crypto
    .createHash("sha256")
    .update(otp.toString())
    .digest("hex");

  const user = await User.findOne({
    email: email.toLowerCase(),
    resetPasswordOTP,
    resetPasswordOTPExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  res.json({
    success: true,
    message: "OTP verified successfully",
    email: user.email,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
    throw new AppError("Email, OTP, and new password are required", 400);
  }

  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  const resetPasswordOTP = crypto
    .createHash("sha256")
    .update(otp.toString())
    .digest("hex");

  const user = await User.findOne({
    email: email.toLowerCase(),
    resetPasswordOTP,
    resetPasswordOTPExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  user.password = password;
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpire = undefined;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  const token = generateToken(user._id, user.tokenVersion);

  res.json({
    success: true,
    message: "Password reset successful",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    },
  });
});

export const validateToken = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Token is valid",
    data: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new AppError("Password is required to delete account", 400);
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    throw new AppError("Incorrect password", 401);
  }

  await User.findByIdAndDelete(req.user._id);

  res.json({
    success: true,
    message: "Account deleted successfully",
  });
});
