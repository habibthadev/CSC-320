import jwt from "jsonwebtoken";
import { asyncHandler } from "./error.middleware.js";
import { AppError } from "./error.middleware.js";
import User from "../models/user.model.js";
import { JWT_SECRET } from "../config/env.js";
import logger from "../utils/logger.js";

const TOKEN_CACHE = new Map();

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  logger.debug(
    {
      method: req.method,
      url: req.url,
      headers: {
        authorization: req.headers.authorization ? "Bearer [REDACTED]" : "None",
        contentType: req.headers["content-type"],
      },
      cookies: req.cookies ? Object.keys(req.cookies) : "None",
    },
    "Authentication middleware called"
  );

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    logger.debug("Token found in Authorization header");
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
    logger.debug("Token found in cookies");
  }

  if (!token) {
    logger.warn(
      {
        method: req.method,
        url: req.url,
        authHeader: req.headers.authorization,
        cookies: req.cookies ? Object.keys(req.cookies) : "None",
      },
      "No token provided"
    );
    throw new AppError("Not authorized, no token provided", 401);
  }

  try {
    if (TOKEN_CACHE.has(token)) {
      const cached = TOKEN_CACHE.get(token);
      if (cached.expires > Date.now()) {
        req.user = cached.user;
        logger.debug(
          { userId: cached.user._id },
          "User authenticated from cache"
        );
        return next();
      } else {
        TOKEN_CACHE.delete(token);
        logger.debug("Cached token expired");
      }
    }

    logger.debug("Verifying JWT token");
    const decoded = jwt.verify(token, JWT_SECRET);

    logger.debug(
      {
        decodedPayload: {
          id: decoded.id,
          tokenVersion: decoded.tokenVersion,
          iat: decoded.iat,
          exp: decoded.exp,
        },
      },
      "JWT decoded successfully"
    );

    if (!decoded.id) {
      logger.warn("Invalid token payload - no user ID");
      throw new AppError("Invalid token payload", 401);
    }

    const user = await User.findById(decoded.id).select("-password").lean();

    if (!user) {
      logger.warn({ userId: decoded.id }, "User not found for token");
      throw new AppError("User not found", 401);
    }

    if (
      user.tokenVersion !== undefined &&
      decoded.tokenVersion !== undefined &&
      decoded.tokenVersion !== user.tokenVersion
    ) {
      logger.warn(
        {
          userId: user._id,
          tokenVersion: decoded.tokenVersion,
          userTokenVersion: user.tokenVersion,
        },
        "Token version mismatch"
      );
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
    logger.debug(
      { userId: user._id, email: user.email },
      "User authenticated successfully"
    );
    next();
  } catch (error) {
    logger.error(
      { error: error.message, tokenExists: !!token },
      "Authentication failed"
    );
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
