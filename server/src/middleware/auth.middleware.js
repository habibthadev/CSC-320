import jwt from "jsonwebtoken";
import { asyncHandler } from "./error.middleware.js";
import { AppError } from "./error.middleware.js";
import User from "../models/user.model.js";
import { JWT_SECRET } from "../config/env.js";

const TOKEN_CACHE = new Map();

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Check for token in cookies (for OAuth users)
  else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new AppError("Not authorized, no token provided", 401);
  }

  try {
    if (TOKEN_CACHE.has(token)) {
      const cached = TOKEN_CACHE.get(token);
      if (cached.expires > Date.now()) {
        req.user = cached.user;
        return next();
      } else {
        TOKEN_CACHE.delete(token);
      }
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.id) {
      throw new AppError("Invalid token payload", 401);
    }

    const user = await User.findById(decoded.id).select("-password").lean();

    if (!user) {
      throw new AppError("User not found", 401);
    }

    if (
      user.tokenVersion !== undefined &&
      decoded.tokenVersion !== user.tokenVersion
    ) {
      throw new AppError("Token has been invalidated", 401);
    }

    TOKEN_CACHE.set(token, {
      user,
      expires: Date.now() + 5 * 60 * 1000,
    });

    if (TOKEN_CACHE.size > 1000) {
      const firstKey = TOKEN_CACHE.keys().next().value;
      TOKEN_CACHE.delete(firstKey);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError("Token has expired", 401);
    } else if (error.name === "JsonWebTokenError") {
      throw new AppError("Invalid token", 401);
    } else if (error.name === "NotBeforeError") {
      throw new AppError("Token not active", 401);
    }
    throw error;
  }
});

export const generateToken = (id, tokenVersion = 0) => {
  return jwt.sign({ id, tokenVersion }, JWT_SECRET, {
    expiresIn: "7d",
    issuer: "csc-320-app",
    audience: "csc-320-users",
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: "csc-320-app",
      audience: "csc-320-users",
    });
  } catch (error) {
    return null;
  }
};

export const invalidateUserTokens = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $inc: { tokenVersion: 1 },
    });

    for (const [token, cached] of TOKEN_CACHE.entries()) {
      if (cached.user._id.toString() === userId.toString()) {
        TOKEN_CACHE.delete(token);
      }
    }
  } catch (error) {
    console.error("Error invalidating user tokens:", error);
  }
};

export const clearTokenCache = () => {
  TOKEN_CACHE.clear();
};

export const optionalAuth = asyncHandler(async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      await protect(req, res, next);
    } catch (error) {
      req.user = null;
      next();
    }
  } else {
    req.user = null;
    next();
  }
});
