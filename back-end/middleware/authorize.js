export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. No token provided." });
    }

    if (roles.length === 0) {
      return next();
    }

    if (req.user.role === "admin" || roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ message: "Forbidden. Insufficient permissions." });
  };
};