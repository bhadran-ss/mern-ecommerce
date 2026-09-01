import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

export const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return allowedRoles.includes(user.role) ? children : <Navigate to="/" replace />;
};
