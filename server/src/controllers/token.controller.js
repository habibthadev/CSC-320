import { verifyRefreshToken, generateTokens } from "../utils/token-utils.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";
import User from "../models/user.model.js";
import { NODE_ENV } from "../config/env.js";
import logger from "../utils/logger.js";

export const refreshToken = asyncHandler(async (req, res) => {
  let refreshToken;

  if (req.cookies && req.cookies.refreshToken) {
    refreshToken = req.cookies.refreshToken;
    logger.debug("Refresh token found in cookies");
  } else if (req.body.refreshToken) {
    refreshToken = req.body.refreshToken;
    logger.debug("Refresh token found in request body");
  }

  if (!refreshToken) {
    logger.warn("No refresh token provided");
    throw new AppError("Refresh token not provided", 401);
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded || !decoded.id) {
      logger.warn("Invalid refresh token payload");
      throw new AppError("Invalid refresh token", 401);
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      logger.warn({ userId: decoded.id }, "User not found for refresh token");
      throw new AppError("User not found", 401);
    }

    const tokens = generateTokens(user._id, user.tokenVersion || 0);

    logger.info({ userId: user._id }, "Token refreshed successfully");

    if (req.cookies && req.cookies.refreshToken) {
      res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    res.json({
      success: true,
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          authProvider: user.authProvider,
        },
      },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError("Refresh token has expired", 401);
    } else if (error.name === "JsonWebTokenError") {
      throw new AppError("Invalid refresh token", 401);
    }
    throw error;
  }
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  if (req.logout) {
    req.logout((err) => {
      if (err) {
        console.error("Passport logout error:", err);
      }
    });
  }

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});
