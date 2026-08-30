import mongoose from "mongoose";

import { getPasswordValidationIssue } from "../validation/auth.validation.js";
import { hashPassword, verifyPassword } from "../utils/password.service.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must contain at least 2 characters"],
      maxlength: [80, "Name must not exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, "Email must not exceed 254 characters"],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email must be valid"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      validate: {
        validator: (password) => getPasswordValidationIssue(password) === null,
        message: (properties) =>
          getPasswordValidationIssue(properties.value) || "Password is invalid",
      },
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
    },
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "disabled"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await hashPassword(this.password);
  }
});

userSchema.methods.comparePassword = function (password) {
  return verifyPassword(password, this.password);
};

userSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    delete returnedObject.password;
    delete returnedObject.__v;
    return returnedObject;
  },
});

const User = mongoose.model("User", userSchema);

export default User;
