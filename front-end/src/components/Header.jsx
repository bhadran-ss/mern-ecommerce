import React, { useRef, useState } from "react";
import { BsCartPlus, BsSearch } from "react-icons/bs";
import { Menu, X, XCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../store/slices/authSlice";
import { clearSearchResult } from "../store/slices/productSlice";

const Header = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef();
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

  const handleSearch = () => {
    const searchQuery = searchRef.current.value.trim();
    if (searchQuery) {
      navigate(`/products?search=${searchQuery}`);
    } else {
      toast.error("Please enter a search term");
    }
  };
  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* Main Header */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="text-xl font-bold md:text-2xl"
        >
          Vistyle
        </button>

        {/* Desktop Navigation / Search */}
        <div className="hidden flex-1 justify-center lg:flex">
          {isSearchOpen ? (
            <div className="flex w-full max-w-lg items-center gap-3 animate-in fade-in duration-200">
              <BsSearch className="h-5 w-5 text-gray-400" />

              <input
                ref={searchRef}
                type="text"
                autoFocus
                placeholder="Search products..."
                className="w-full border-b border-gray-300 bg-transparent py-2 outline-none transition-all focus:border-black"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                    setIsSearchOpen(false);
                  }
                }}
              />

              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-gray-500 transition hover:text-black"
              >
                <XCircle size={22} />
              </button>
            </div>
          ) : (
            <nav className="flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);

                    if (item.label === "Shop") {
                      dispatch(clearSearchResult());
                    }
                  }}
                  className="group relative font-medium transition"
                >
                  {item.label}

                  <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 bg-black transition-transform duration-300 group-hover:scale-x-100" />
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Login / Logout */}
          {user ? (
            <button
              onClick={() => dispatch(logoutUser())}
              className="hidden text-sm font-medium hover:underline md:block"
            >
              Logout
            </button>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <button onClick={() => navigate("/register")}>Register</button>
              <span>/</span>
              <button onClick={() => navigate("/login")}>Login</button>
            </div>
          )}

          {/* Search */}
          <button
            aria-label="Search"
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              setIsMobileOpen(false);
            }}
            className="transition duration-300 hover:scale-110"
          >
            <BsSearch className="h-5 w-5 text-gray-700 hover:text-black" />
          </button>

          {/* Dashboard */}
          {(user?.role === "admin" || user?.role === "seller") && (
            <button
              className="hidden text-sm font-medium md:block"
              onClick={() =>
                navigate(
                  user.role === "admin" ? "/secret-panel" : "/seller-panel",
                )
              }
            >
              {user.role === "admin" ? "Admin" : "Seller"}
            </button>
          )}

          {/* Cart */}
          <button
            aria-label="Cart"
            className="relative"
            onClick={() => navigate("/cart")}
          >
            <BsCartPlus className="h-5 w-5" />

            {cart.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border bg-white text-xs">
                {cart.length > 99 ? "99+" : cart.length}
              </span>
            )}
          </button>

          {/* Mobile Menu */}
          <button
            className="lg:hidden"
            aria-label="Menu"
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
        <div className="absolute left-0 top-full w-full border-t bg-white shadow-lg lg:hidden">
          <nav className="flex flex-col">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileOpen(false);

                  if (item.label === "Shop") {
                    dispatch(clearSearchResult());
                  }
                }}
                className="border-b px-6 py-4 text-left hover:bg-gray-100"
              >
                {item.label}
              </button>
            ))}

            {!user && (
              <>
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsMobileOpen(false);
                  }}
                  className="border-b px-6 py-4 text-left hover:bg-gray-100"
                >
                  Login
                </button>

                <button
                  onClick={() => {
                    navigate("/register");
                    setIsMobileOpen(false);
                  }}
                  className="border-b px-6 py-4 text-left hover:bg-gray-100"
                >
                  Register
                </button>
              </>
            )}

            {(user?.role === "admin" || user?.role === "seller") && (
              <button
                onClick={() => {
                  navigate(
                    user.role === "admin" ? "/secret-panel" : "/seller-panel",
                  );
                  setIsMobileOpen(false);
                }}
                className="border-b px-6 py-4 text-left hover:bg-gray-100"
              >
                {user.role === "admin" ? "Admin Panel" : "Seller Panel"}
              </button>
            )}

            {user && (
              <button
                onClick={() => {
                  dispatch(logoutUser());
                  setIsMobileOpen(false);
                }}
                className="px-6 py-4 text-left text-red-600 hover:bg-red-50"
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
            <input
              ref={searchRef}
              type="text"
              autoFocus
              placeholder="Search products..."
              className="flex-1 rounded-full border px-4 py-2 outline-none focus:ring-2 focus:ring-black"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                  setIsSearchOpen(false);
                }
              }}
            />

            <button
              onClick={() => setIsSearchOpen(false)}
              className="text-gray-500 hover:text-black"
            >
              <XCircle size={22} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
