import { Router } from "express";
import * as authController from "../controllers/authController.js";
import * as userController from "../controllers/userController.js";

const {
  login,
  signup,
  logout,
  forgotPassword,
  verifyOTP,
  resetPassword,
  googleAuth,
  googleAuthCallback,
  protect,
  updatePassword,
} = authController;
const {
  getUser,
  updateMe,
  deleteMe,
  uploadUserPhoto,
  resizeUserPhoto,
  getAllUsers,
  updateUser,
  deleteUser,
} = userController;

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyOTP", verifyOTP);
router.patch("/resetPassword", resetPassword);

router.get("/auth/google", googleAuth);
router.get("/auth/google/callback", googleAuthCallback);


router.use(protect);

router.patch("/updateMyPassword", updatePassword);
router.get("/me", userController.getMe, userController.getUser);
router.patch("/updateMe", uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete("/deleteMe", deleteMe);

router.use(authController.restrictTo("admin"));

router.get("/", getAllUsers);

router.get("/all", getAllUsers);

router.get("/:id", getUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
