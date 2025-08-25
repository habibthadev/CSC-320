import express from "express";
import passport from "../config/passport.js";
import { generateTokens } from "../utils/token-utils.js";
import { CLIENT_URL, NODE_ENV } from "../config/env.js";
import { protect } from "../middleware/auth.middleware.js";
import User from "../models/user.model.js";

const router = express.Router();


router.get("/google/link-account", protect, (req, res, next) => {
  req.session.linkAccountUserId = req.user._id;

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: "link_account", 
  })(req, res, next);
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/login?error=oauth_failed`,
  }),
  async (req, res) => {
    try {
      const user = req.user;

      const { accessToken, refreshToken } = generateTokens(user._id);

      user.lastLogin = new Date();
      await user.save();

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });


      res.redirect(`${CLIENT_URL}/dashboard?auth=success`);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect(`${CLIENT_URL}/login?error=oauth_error`);
    }
  }
);

router.post("/google/link", protect, async (req, res) => {
  try {
    const { googleAuthCode } = req.body;
    const currentUser = req.user;

    if (!googleAuthCode) {
      return res.status(400).json({
        success: false,
        message: "Google authorization code is required",
      });
    }

    if (currentUser.googleId) {
      return res.status(400).json({
        success: false,
        message: "Google account is already linked to this user",
      });
    }

    // Here you would typically verify the Google auth code and get user info
    // For now, we'll return a success response indicating the linking process
    // would need frontend integration with Google OAuth to get the auth code

    res.json({
      success: true,
      message: "To link your Google account, please use the Google OAuth flow",
      instructions: "Use GET /auth/google while authenticated to link accounts",
    });
  } catch (error) {
    console.error("Google link error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during Google account linking",
    });
  }
});

router.delete("/google/unlink", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.authProvider === "google" && !user.password) {
      return res.status(400).json({
        success: false,
        message: "Cannot unlink Google account. Please set a password first.",
      });
    }

    if (!user.googleId) {
      return res.status(400).json({
        success: false,
        message: "No Google account is linked to this user",
      });
    }

    user.googleId = undefined;
    user.authProvider = "local";
    await user.save();

    res.json({
      success: true,
      message: "Google account unlinked successfully",
    });
  } catch (error) {
    console.error("Google unlink error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during Google account unlinking",
    });
  }
});

router.get("/oauth/status", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "googleId authProvider email"
    );

    res.json({
      success: true,
      data: {
        hasGoogleAccount: !!user.googleId,
        authProvider: user.authProvider,
        email: user.email,
        canUnlinkGoogle:
          user.authProvider === "google" ? !!user.password : true,
      },
    });
  } catch (error) {
    console.error("OAuth status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching OAuth status",
    });
  }
});


router.post("/oauth/logout", (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    req.logout((err) => {
      if (err) {
        console.error("Passport logout error:", err);
      }
    });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("OAuth logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
});

export default router;
