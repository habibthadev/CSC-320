import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        "Please add a valid email",
      ],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    resetPasswordOTP: String,
    resetPasswordOTPExpire: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash OTP for password reset
userSchema.methods.generateResetOTP = function () {
  // Generate a 6-digit OTP
  const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the OTP
  this.resetPasswordOTP = crypto
    .createHash("sha256")
    .update(resetOTP)
    .digest("hex");

  // Set OTP expiration to 10 minutes
  this.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000;

  return resetOTP;
};

const User = mongoose.model("User", userSchema);

export default User;
