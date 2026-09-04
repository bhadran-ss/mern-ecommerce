import mongoose from "mongoose";
import User from "../models/user.model.js";
import { ApiError } from "../middleware/errors.js";

const allowedBusinessTypes = new Set(["individual", "registered"]);
const allowedCategories = new Set([
  "Clothing",
  "Bags & accessories",
  "Shoes",
  "Other",
]);

const getApplicationInput = (body) => {
  const {
    storeName,
    contactPhone,
    businessType,
    category,
    website = "",
    description,
  } = body ?? {};
  const normalizedStoreName =
    typeof storeName === "string" ? storeName.trim() : "";
  const normalizedPhone =
    typeof contactPhone === "string" ? contactPhone.trim() : "";
  const normalizedWebsite = typeof website === "string" ? website.trim() : null;
  const normalizedDescription =
    typeof description === "string" ? description.trim() : "";
  const digitCount = normalizedPhone.replace(/\D/g, "").length;

  if (
    normalizedStoreName.length < 2 ||
    normalizedStoreName.length > 100 ||
    digitCount < 7 ||
    digitCount > 15 ||
    normalizedPhone.length > 24 ||
    !/^\+?[\d\s().-]+$/.test(normalizedPhone) ||
    !allowedBusinessTypes.has(businessType) ||
    !allowedCategories.has(category) ||
    normalizedWebsite === null ||
    normalizedWebsite.length > 200 ||
    normalizedDescription.length < 30 ||
    normalizedDescription.length > 1000
  ) {
    return null;
  }

  if (normalizedWebsite) {
    try {
      if (new URL(normalizedWebsite).protocol !== "https:") return null;
    } catch {
      return null;
    }
  }

  return {
    storeName: normalizedStoreName,
    contactPhone: normalizedPhone,
    businessType,
    category,
    website: normalizedWebsite,
    description: normalizedDescription,
    status: "pending",
    submittedAt: new Date(),
    reviewedAt: null,
    reviewNote: "",
  };
};

const getSellerApplication = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("role sellerApplication")
      .lean();
    if (!user) {
      return next(new ApiError(404, "USER_NOT_FOUND", "Account not found."));
    }
    return res.status(200).json({
      application: user.sellerApplication ?? null,
      role: user.role,
    });
  } catch (error) {
    return next(error);
  }
};

const submitSellerApplication = async (req, res, next) => {
  const application = getApplicationInput(req.body);
  if (!application) {
    return next(
      new ApiError(
        400,
        "VALIDATION_ERROR",
        "Enter valid store details, a phone number, business type, category, and a description of at least 30 characters. Website links must use HTTPS.",
      ),
    );
  }

  try {
    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        role: "customer",
        "sellerApplication.status": { $nin: ["pending", "approved"] },
      },
      { $set: { sellerApplication: application } },
      { new: true, runValidators: true },
    ).select("role sellerApplication");

    if (!user) {
      return next(
        new ApiError(
          409,
          "APPLICATION_NOT_ALLOWED",
          "Your account already has an active seller application or seller access.",
        ),
      );
    }

    return res.status(201).json({
      message: "Seller application submitted for review.",
      application: user.sellerApplication,
    });
  } catch (error) {
    return next(error);
  }
};

const listPendingSellerApplications = async (_req, res, next) => {
  try {
    const users = await User.find({ "sellerApplication.status": "pending" })
      .select("name email sellerApplication")
      .sort({ "sellerApplication.submittedAt": 1 })
      .lean();

    return res.status(200).json({
      applications: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        ...user.sellerApplication,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

const reviewSellerApplication = async (req, res, next) => {
  const { userId } = req.params;
  const { decision, reviewNote = "" } = req.body ?? {};
  const normalizedNote =
    typeof reviewNote === "string" ? reviewNote.trim() : null;

  if (
    !mongoose.isValidObjectId(userId) ||
    !["approved", "rejected"].includes(decision) ||
    normalizedNote === null ||
    normalizedNote.length > 500 ||
    (decision === "rejected" && normalizedNote.length < 10)
  ) {
    return next(
      new ApiError(
        400,
        "VALIDATION_ERROR",
        "Provide a valid application decision. Declined applications require a review note of 10 to 500 characters.",
      ),
    );
  }

  try {
    const updates = {
      "sellerApplication.status": decision,
      "sellerApplication.reviewedAt": new Date(),
      "sellerApplication.reviewNote": normalizedNote,
    };
    if (decision === "approved") {
      updates.role = "seller";
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, "sellerApplication.status": "pending" },
      { $set: updates },
      { new: true, runValidators: true },
    )
      .select("name email role sellerApplication")
      .lean();

    if (!user) {
      return next(
        new ApiError(
          404,
          "APPLICATION_NOT_FOUND",
          "No pending seller application was found for this account.",
        ),
      );
    }

    return res.status(200).json({
      message:
        decision === "approved"
          ? "Seller application approved."
          : "Seller application declined.",
      application: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        ...user.sellerApplication,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export {
  getSellerApplication,
  listPendingSellerApplications,
  reviewSellerApplication,
  submitSellerApplication,
};
