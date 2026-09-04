import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const sellerApplicationSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 24,
    },
    businessType: {
      type: String,
      enum: ["individual", "registered"],
      required: true,
    },
    category: {
      type: String,
      enum: ["Clothing", "Bags & accessories", "Shoes", "Other"],
      required: true,
    },
    website: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 30,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      required: true,
    },
    submittedAt: {
      type: Date,
      required: true,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewNote: {
      type: String,
      maxlength: 500,
      default: "",
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
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
    sellerApplication: {
      type: sellerApplicationSchema,
      default: undefined,
    },
  },
  { timestamps: true },
);

const removePasswordField = (_document, returnedObject) => {
  delete returnedObject.password;
  return returnedObject;
};

userSchema.set("toJSON", { transform: removePasswordField });
userSchema.set("toObject", { transform: removePasswordField });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
