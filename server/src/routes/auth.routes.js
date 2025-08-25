import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  verifyOTP,
  resetPassword,
  validateToken,
  deleteAccount,
} from "../controllers/auth.controller.js";
import { refreshToken, logout } from "../controllers/token.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

router.use(protect);

router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.post("/logout-user", logoutUser);
router.get("/validate", validateToken);
router.delete("/account", deleteAccount);

export default router;
