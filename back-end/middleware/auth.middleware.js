import User from "../models/user.model.js";
import { decryptAccessToken } from "../utils/token.service.js";

export const protectRoute = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized. No token provided." });
  }

  try {
    const decoded = await decryptAccessToken(token);
    const user = await User.findById(decoded.sub).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Access token verification error:", error.name);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }

    res.status(401).json({ message: "Invalid token" });
  }
};

export const adminRoute = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden. Admins only." });
  }
};
