import crypto from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import passport from "passport";
import User from "../models/userModel.js";
import { catchAsync } from "../utils/catch-async.js";
import AppError from "../utils/app-error.js";
import Email from "../utils/email.js";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role === "admin" ? "user" : req.body.role, // Prevent creating admin users directly
  });

  // Send welcome email
  try {
    const url = `${req.protocol}://${req.get("host")}/me`;
    await new Email(newUser, url).sendWelcome();
  } catch (err) {
    console.log("Error sending welcome email:", err);
  }

  createSendToken(newUser, 201, req, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

export const logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: "success" });
};

export const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'user']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with this email address.", 404));
  }

  // 2) Generate the random OTP
  const resetOTP = user.createPasswordResetOTP();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    await new Email(user, "").sendPasswordReset(resetOTP);

    res.status(200).json({
      status: "success",
      message: "OTP sent to email!",
    });
  } catch (err) {
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});

export const verifyOTP = catchAsync(async (req, res, next) => {
  // 1) Get OTP and email from request
  const { otp, email } = req.body;

  if (!otp || !email) {
    return next(new AppError("Please provide OTP and email", 400));
  }

  // 2) Hash the OTP for comparison
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  // 3) Find user with this hashed OTP and check if it's expired
  const user = await User.findOne({
    email,
    passwordResetOTP: hashedOTP,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("OTP is invalid or has expired", 400));
  }

  // 4) If OTP is valid, send success response
  res.status(200).json({
    status: "success",
    message: "OTP verified successfully",
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get OTP, email, and new password from request
  const { otp, email, password, passwordConfirm } = req.body;

  if (!otp || !email || !password || !passwordConfirm) {
    return next(new AppError("Please provide all required fields", 400));
  }

  // 2) Hash the OTP for comparison
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  // 3) Find user with this hashed OTP and check if it's expired
  const user = await User.findOne({
    email,
    passwordResetOTP: hashedOTP,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("OTP is invalid or has expired", 400));
  }

  // 4) If OTP is valid, set the new password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetOTP = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 5) Log the user in, send JWT
  createSendToken(user, 200, req, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
});

// Google Authentication
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleAuthCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user, info) => {
    if (err || !user) {
      return next(new AppError("Authentication failed", 401));
    }

    createSendToken(user, 200, req, res);
  })(req, res, next);
};