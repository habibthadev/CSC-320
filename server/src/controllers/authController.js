import crypto from "crypto";
import User from "../models/userModel.js";
import { asyncHandler, AppError } from "../middleware/errorMiddleware.js";
import { generateToken, generateRefreshToken } from "../utils/tokenUtils.js";
import {
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../utils/emailService.js";

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new AppError("User already exists", 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    // Send welcome email
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

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
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

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
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

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
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

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User with that email does not exist", 404);
  }

  // Generate reset OTP
  const resetOTP = user.generateResetOTP();
  await user.save();

  try {
    // Send email with reset OTP
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

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Hash OTP
  const resetPasswordOTP = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  // Find user with matching OTP and non-expired OTP
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

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;

  // Hash OTP
  const resetPasswordOTP = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  // Find user with matching OTP and non-expired OTP
  const user = await User.findOne({
    email,
    resetPasswordOTP,
    resetPasswordOTPExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  // Set new password
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

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Generate new access token
    const accessToken = generateToken(decoded.id);

    res.json({
      token: accessToken,
    });
  } catch (error) {
    throw new AppError("Invalid refresh token", 401);
  }
});
