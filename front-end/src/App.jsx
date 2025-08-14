import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Header from "./components/Header";
import Register from "./pages/Register";
import AdminPage from "./pages/AdminPage";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";
import { useProductStore } from "./stores/useProductStore";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import useCartStore from "./stores/useCartStore";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import DetailedCard from "./pages/DetailedCard";
import AllProducts from "./pages/AllProducts";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getFeaturedProducts, featuredProducts } = useProductStore();
  const { getCart } = useCartStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  useEffect(() => {
    if (user) {
      getCart();
    }
  }, [user, getCart]);
  useEffect(() => {
    if (featuredProducts.length === 0) {
      getFeaturedProducts();
    }
  }, [getFeaturedProducts, featuredProducts]);

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
