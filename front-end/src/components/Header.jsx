import React, { useRef, useState } from "react";
import { BsCartPlus, BsSearch } from "react-icons/bs";
import { Menu, X, XCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { logoutUser } from "../store/slices/authSlice";
import { clearSearchResult } from "../store/slices/productSlice";

const Header = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const desktopSearchRef = useRef();
  const mobileSearchRef = useRef();
  const navItems = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/products" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);
  const navigate = useNavigate();

  const handleSearch = (inputRef) => {
    const searchQuery = inputRef.current?.value.trim() || "";
    if (searchQuery) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsMobileOpen(false);
    } else {
      toast.error("Please enter a search term");
    }
  };
  const dashboardPath =
    user?.role === "admin"
      ? "/secret-panel"
      : user?.role === "seller"
        ? "/seller-panel"
        : null;
  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* Main Header */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          aria-label="Vistyle home"
          className="rounded-sm text-xl font-bold text-gray-900 no-underline hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black md:text-2xl"
        >
          Vistyle
        </Link>

        {/* Desktop Navigation / Search */}
        <div className="hidden flex-1 justify-center lg:flex">
          {isSearchOpen ? (
            <form
              className="flex w-full max-w-lg items-center gap-3 animate-in fade-in duration-200"
              onSubmit={(event) => {
                event.preventDefault();
                handleSearch(desktopSearchRef);
                if (desktopSearchRef.current?.value.trim()) setIsSearchOpen(false);
              }}
            >
              <BsSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
              <input
                ref={desktopSearchRef}
                aria-label="Search products"
                type="search"
                autoFocus
                placeholder="Search products..."
                className="w-full border-b border-gray-300 bg-transparent py-2 outline-none transition-all focus:border-black"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setIsSearchOpen(false)}
                className="rounded-sm text-gray-500 transition hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                <XCircle size={22} aria-hidden="true" />
              </button>
            </form>
          ) : (
            <nav className="flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => item.label === "Shop" && dispatch(clearSearchResult())}
                  className="group relative rounded-sm font-medium text-gray-900 no-underline transition hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                >
                  {item.label}

                  <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 bg-black transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Login / Logout */}
          {user ? (
            <>
              {user.role === "customer" && (
                <Link
                  to="/orders"
                  className="hidden rounded-sm text-sm font-medium hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black md:block"
                >
                  My orders
                </Link>
              )}
              <button
                type="button"
                onClick={() => dispatch(logoutUser())}
                className="hidden rounded-sm text-sm font-medium hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black md:block"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="hidden items-center gap-2 text-sm md:flex">
              <Link
                to="/register"
                className="rounded-sm text-gray-900 no-underline hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Register
              </Link>
              <span>/</span>
              <Link
                to="/login"
                className="rounded-sm text-gray-900 no-underline hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Login
              </Link>
            </div>
          )}

          {/* Search */}
          <button
            type="button"
            aria-label="Search"
            aria-expanded={isSearchOpen}
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              setIsMobileOpen(false);
            }}
            className="rounded-sm transition duration-300 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
          >
              <BsSearch
                className="h-5 w-5 text-gray-700 hover:text-black"
                aria-hidden="true"
              />
          </button>

          {/* Dashboard */}
          {dashboardPath && (
            <Link
              to={dashboardPath}
              className="hidden rounded-sm text-sm font-medium text-gray-900 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black md:block"
            >
              {user.role === "admin" ? "Admin" : "Seller"}
            </Link>
          )}

          {/* Cart */}
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative rounded-sm text-gray-900 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <BsCartPlus className="h-5 w-5" aria-hidden="true" />

            {cart.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border bg-white text-xs">
                {cart.length > 99 ? "99+" : cart.length}
              </span>
            )}
          </Link>

          {/* Mobile Menu */}
          <button
            type="button"
            className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black lg:hidden"
            aria-label="Menu"
            aria-expanded={isMobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => {
              setIsMobileOpen(!isMobileOpen);
              setIsSearchOpen(false);
            }}
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div
          id="mobile-navigation"
          className="absolute left-0 top-full w-full border-t bg-white shadow-lg lg:hidden"
        >
          <nav className="flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => {
                  setIsMobileOpen(false);
                  if (item.label === "Shop") dispatch(clearSearchResult());
                }}
                className="border-b px-6 py-4 text-left text-gray-900 no-underline hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-black"
              >
                {item.label}
              </Link>
            ))}

            {!user && (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileOpen(false)}
                  className="border-b px-6 py-4 text-left text-gray-900 no-underline hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-black"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setIsMobileOpen(false)}
                  className="border-b px-6 py-4 text-left text-gray-900 no-underline hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-black"
                  >
                    Register
                </Link>
              </>
            )}

            {dashboardPath && (
              <Link
                to={dashboardPath}
                onClick={() => setIsMobileOpen(false)}
                className="border-b px-6 py-4 text-left text-gray-900 no-underline hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-black"
              >
                {user.role === "admin" ? "Admin Panel" : "Seller Panel"}
              </Link>
            )}

            {user?.role === "customer" && (
              <Link
                to="/orders"
                onClick={() => setIsMobileOpen(false)}
                className="border-b px-6 py-4 text-left text-gray-900 no-underline hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-black"
              >
                My orders
              </Link>
            )}

            {user && (
              <button
                type="button"
                onClick={() => {
                  dispatch(logoutUser());
                  setIsMobileOpen(false);
                }}
                className="px-6 py-4 text-left text-red-600 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-red-700"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      )}
      {/* Mobile Search */}
      {isSearchOpen && (
        <div className="border-t bg-white p-4 shadow-md lg:hidden">
          <div className="flex items-center gap-2">
            <form
              className="flex flex-1 items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                handleSearch(mobileSearchRef);
                if (mobileSearchRef.current?.value.trim()) setIsSearchOpen(false);
              }}
            >
              <input
                ref={mobileSearchRef}
                aria-label="Search products"
                type="search"
                autoFocus
                placeholder="Search products..."
                className="min-w-0 flex-1 rounded-full border px-4 py-2 outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="submit"
                className="rounded-full border border-gray-800 px-4 py-2 text-sm font-medium text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Search
              </button>

              <button
                type="button"
                aria-label="Close search"
                onClick={() => setIsSearchOpen(false)}
                className="rounded-sm text-gray-500 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                <XCircle size={22} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
