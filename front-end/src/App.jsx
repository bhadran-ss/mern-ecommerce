import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Header from "./components/Header";
import Register from "./pages/Register";
import AdminPage from "./pages/AdminPage";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth as checkAuthThunk } from "./store/slices/authSlice";
import { getFeaturedProducts as getFeaturedProductsThunk } from "./store/slices/productSlice";
import { getCart as getCartThunk } from "./store/slices/cartSlice";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import DetailedCard from "./pages/DetailedCard";
import AllProducts from "./pages/AllProducts";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

function App() {
  const dispatch = useDispatch();
  const { user, checkingAuth } = useSelector((state) => state.auth);
  const featuredProducts = useSelector(
    (state) => state.products.featuredProducts,
  );

  useEffect(() => {
    dispatch(checkAuthThunk());
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
        className="fixed inset-0 flex items-center justify-center bg-white z-50"
      >
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative py-0 text-2xl">
      <Header />
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
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
            user?.role === "seller" || user?.role === "admin" ? (
              <AdminPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route
          path="/cart"
          element={user ? <CartPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/purchase-success"
          element={user ? <PurchaseSuccessPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/purchase-cancel"
          element={user ? <PurchaseCancelPage /> : <Navigate to="/login" />}
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
