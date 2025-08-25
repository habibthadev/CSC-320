import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxLength: [50, "Name cannot exceed 50 characters"],
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
      index: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    resetPasswordOTP: String,
    resetPasswordOTPExpire: Date,
    lastLogin: {
      type: Date,
      default: null,
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ createdAt: -1 });

userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual("documents", {
  ref: "Document",
  localField: "_id",
  foreignField: "user",
});

userSchema.virtual("questions", {
  ref: "Question",
  localField: "_id",
  foreignField: "user",
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateResetOTP = function () {
  const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();

  this.resetPasswordOTP = crypto
    .createHash("sha256")
    .update(resetOTP)
    .digest("hex");

  this.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000;

  return resetOTP;
};

const User = mongoose.model("User", userSchema);

export default User;
