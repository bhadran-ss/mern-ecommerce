import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Header from "./components/Header";
import Register from "./pages/Register";
import AdminPage from "./pages/AdminPage";
import SellerPage from "./pages/SellerPage";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  checkAuth as checkAuthThunk,
  sessionExpired,
} from "./store/slices/authSlice";
import { AUTH_SESSION_EXPIRED_EVENT } from "./lib/axios";
import { getFeaturedProducts as getFeaturedProductsThunk } from "./store/slices/productSlice";
import { getCart as getCartThunk } from "./store/slices/cartSlice";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import OrdersPage from "./pages/OrdersPage";
import DetailedCard from "./pages/DetailedCard";
import AllProducts from "./pages/AllProducts";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import SellerApplicationPage from "./pages/SellerApplicationPage";

const getLoginDestination = (returnTo) => {
  if (!returnTo) return "/";

  try {
    const target = new URL(returnTo, "https://vistyle.invalid");
    if (target.origin !== "https://vistyle.invalid") {
      return "/";
    }

    if (target.pathname === "/cart" && !target.search && !target.hash) {
      return "/cart";
    }
    if (target.pathname === "/orders" && !target.search && !target.hash) {
      return "/orders";
    }
    if (target.pathname === "/sell" && !target.search && !target.hash) {
      return "/sell";
    }
    if (
      /^\/orders\/[a-f\d]{24}$/i.test(target.pathname) &&
      !target.search &&
      !target.hash
    ) {
      return target.pathname;
    }
    if (target.pathname !== "/purchase-success") return "/";

    const sessionId = target.searchParams.get("session_id");
    if (!sessionId || !/^cs_test_[A-Za-z0-9]+$/.test(sessionId)) {
      return "/";
    }

    return `/purchase-success?session_id=${encodeURIComponent(sessionId)}`;
  } catch {
    return "/";
  }
};

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { pathname } = location;
  const loginDestination = getLoginDestination(
    new URLSearchParams(location.search).get("returnTo"),
  );
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const hasCustomShell =
    isAuthPage ||
    pathname === "/cart" ||
    pathname === "/orders" ||
    pathname.startsWith("/orders/") ||
    pathname === "/purchase-success" ||
    pathname === "/purchase-cancel" ||
    pathname === "/seller-panel" ||
    pathname === "/sell" ||
    pathname === "/secret-panel";
  const { user, checkingAuth } = useSelector((state) => state.auth);
  const featuredProducts = useSelector(
    (state) => state.products.featuredProducts,
  );

  useEffect(() => {
    dispatch(checkAuthThunk());
  }, [dispatch]);

  useEffect(() => {
    const handleSessionExpired = () => dispatch(sessionExpired());
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () =>
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(getCartThunk());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (featuredProducts.length === 0) {
      dispatch(getFeaturedProductsThunk());
    }
  }, [dispatch, featuredProducts.length]);

  if (checkingAuth) {
    return (
      <div
        id="preloader"
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#11110f]"
      >
        <div className="loader auth-loader"></div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#11110f] py-0 text-base text-[#f4f1e9]">
      {!hasCustomShell && <Header />}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: "#181815",
            color: "#f4f1e9",
            border: "1px solid rgba(255,255,255,.12)",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={loginDestination} replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" /> : <Register />}
        />
        <Route
          path="/secret-panel"
          element={user?.role === "admin" ? <AdminPage /> : <Navigate to="/" />}
        />
        <Route
          path="/seller-panel"
          element={
            user?.role === "seller" ? <SellerPage /> : <Navigate to="/" />
          }
        />
        <Route
          path="/sell"
          element={
            !user ? (
              <Navigate to="/login?returnTo=%2Fsell" replace />
            ) : user.role === "seller" ? (
              <Navigate to="/seller-panel" replace />
            ) : user.role === "admin" ? (
              <Navigate to="/secret-panel" replace />
            ) : (
              <SellerApplicationPage />
            )
          }
        />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route
          path="/cart"
          element={
            user ? (
              <CartPage />
            ) : (
              <Navigate to="/login?returnTo=%2Fcart" replace />
            )
          }
        />
        <Route
          path="/purchase-success"
          element={<PurchaseSuccessPage />}
        />
        <Route
          path="/purchase-cancel"
          element={<PurchaseCancelPage />}
        />
        <Route
          path="/orders"
          element={
            user ? (
              <OrdersPage />
            ) : (
              <Navigate
                to={`/login?returnTo=${encodeURIComponent(pathname)}`}
                replace
              />
            )
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            user ? (
              <OrdersPage />
            ) : (
              <Navigate
                to={`/login?returnTo=${encodeURIComponent(pathname)}`}
                replace
              />
            )
          }
        />
        <Route path="/product/:id" element={<DetailedCard />} />
        <Route path="/products" element={<AllProducts />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </div>
  );
}

export default App;
