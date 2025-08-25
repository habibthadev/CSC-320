import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_REFRESH_SECRET } from "../config/env.js";

export const generateToken = (id, tokenVersion = 0) => {
  return jwt.sign({ id, tokenVersion }, JWT_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (id, tokenVersion = 0) => {
  return jwt.sign({ id, tokenVersion }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export const generateTokens = (id, tokenVersion = 0) => {
  return {
    accessToken: generateToken(id, tokenVersion),
    refreshToken: generateRefreshToken(id, tokenVersion),
  };
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};
