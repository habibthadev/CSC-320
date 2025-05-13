import crypto from "crypto";
import User from "../models/userModel.js";
import { asyncHandler, AppError } from "../middleware/errorMiddleware.js";
import { generateToken, generateRefreshToken } from "../utils/tokenUtils.js";
import {
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../utils/emailService.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new AppError("User already exists", 400);
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    await sendWelcomeEmail(email, name);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      refreshToken: generateRefreshToken(user._id),
    });
  } else {
    throw new AppError("Invalid user data", 400);
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    throw new AppError("Invalid credentials", 401);
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
    refreshToken: generateRefreshToken(user._id),
  });
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } else {
    throw new AppError("User not found", 404);
  }
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      token: generateToken(updatedUser._id),
    });
  } else {
    throw new AppError("User not found", 404);
  }
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User with that email does not exist", 404);
  }

  const resetOTP = user.generateResetOTP();
  await user.save();

  try {
    await sendPasswordResetEmail(user.email, resetOTP, user.name);

    res.json({
      success: true,
      message: "OTP sent to email",
      email: user.email,
    });
  } catch (error) {
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    await user.save();

    throw new AppError("Email could not be sent", 500);
  }
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const resetPasswordOTP = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  const user = await User.findOne({
    email,
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

  const resetPasswordOTP = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  const user = await User.findOne({
    email,
    resetPasswordOTP,
    resetPasswordOTPExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  user.password = password;
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpire = undefined;
  await user.save();

  res.json({
    success: true,
    message: "Password reset successful",
    token: generateToken(user._id),
    refreshToken: generateRefreshToken(user._id),
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const accessToken = generateToken(decoded.id);

    res.json({
      token: accessToken,
    });
  } catch (error) {
    throw new AppError("Invalid refresh token", 401);
  }
});
