import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} from "./env.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if this is an account linking request
        const isLinkingAccount = req.session && req.session.linkAccountUserId;

        if (isLinkingAccount) {
          // Handle account linking for existing user
          const existingUser = await User.findById(
            req.session.linkAccountUserId
          );

          if (existingUser) {
            // Check if Google account is already linked to another user
            const googleUserExists = await User.findOne({
              googleId: profile.id,
            });

            if (
              googleUserExists &&
              googleUserExists._id.toString() !== existingUser._id.toString()
            ) {
              return done(
                new Error(
                  "This Google account is already linked to another user"
                ),
                null
              );
            }

            // Link Google account to existing user
            existingUser.googleId = profile.id;
            existingUser.avatar =
              existingUser.avatar || profile.photos[0]?.value;
            if (existingUser.authProvider === "local") {
              existingUser.authProvider = "google";
            }
            await existingUser.save();

            // Clear the linking session
            delete req.session.linkAccountUserId;

            return done(null, existingUser);
          }
        }

        // Standard OAuth flow
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          user.googleId = profile.id;
          user.avatar = user.avatar || profile.photos[0]?.value;
          await user.save();
          return done(null, user);
        }

        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0]?.value,
          isEmailVerified: true,
          authProvider: "google",
        });

        await user.save();
        return done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
