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
    <>
      {/* Top Navigation Bar */}
      <header className="w-full shadow-sm px-4 sm:px-6 lg:px-10 py-4 lg:py-6 sticky top-0 z-50 bg-white">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="text-xl md:text-2xl font-bold">Vistyle</div>
          {/* Search Bar */}
          {isSearchOpen ? (
            <div className="absolute inset-x-0 top-0 bg-white p-4 shadow-md z-50">
              <input
                type="text"
                placeholder="Search..."
                id="search"
                ref={searchRef}
                className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 md:max-w-md"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <XCircle size={24} />
              </button>
            </div>
          ) : (
            <nav className="hidden md:flex items-center space-x-5 lg:space-x-8 px-4 py-2">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  onClick={() => {
                    setActiveLink(item.label);
                    navigate(item.path);
                    if (item.label === "Shop") {
                      dispatch(clearSearchResult());
                    }
                  }}
                  className={`font-medium relative ${
                    activeLink === item.label
                      ? "after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-white after:opacity-100 text-black"
                      : "text-black"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}
          {/* Mobile Nav */}
          {isMobileOpen && (
            <div className="absolute left-0 top-full w-full bg-white shadow-lg md:hidden">
              <nav className="flex flex-col items-start space-y-4 p-4">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.path}
                    onClick={() => {
                      setActiveLink(item.label);
                      setIsMobileOpen(false);
                      navigate(item.path);
                      if (item.label === "Shop") {
                        dispatch(clearSearchResult());
                      }
                    }}
                    className={`relative font-medium text-black after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:bg-black after:transition-transform after:duration-300 after:scale-x-0 after:origin-left ${
                      activeLink === item.label ? "after:scale-x-100" : ""
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          )}

          {/* User Actions */}

          <div className="flex items-center gap-5">
            {user ? (
              <div className="flex items-center space-x-1 text-gray-900 text-sm font-medium px-4 sm:px-0">
                <button
                  onClick={() => dispatch(logoutUser())}
                  className="hover:text-black hover:underline transition duration-150"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-gray-900 text-sm font-medium px-4 sm:px-0">
                <button
                  onClick={() => navigate("/register")}
                  className="hover:text-black hover:underline transition duration-150"
                >
                  Register
                </button>
                <span className="text-gray-400">/</span>
                <button
                  onClick={() => navigate("/login")}
                  className="hover:text-black hover:underline transition duration-150"
                >
                  Login
                </button>
              </div>
            )}
            {/* Icons */}
            <BsSearch
              className="w-5 h-5 cursor-pointer text-black"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            />
            {(user?.role === "admin" || user?.role === "seller") && (
              <button
                onClick={() =>
                  navigate(
                    user?.role === "admin" ? "/secret-panel" : "/seller-panel",
                  )
                }
                className="hover:text-black hover:underline transition duration-150 text-sm font-medium px-4 sm:px-0"
              >
                {user?.role === "admin" ? "Admin" : "Seller"}
              </button>
            )}
            <div className="relative" onClick={() => navigate("/cart")}>
              <BsCartPlus className="w-5 h-5 cursor-pointer text-black" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 text-xs font-semibold text-black bg-white border border-gray-400 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden focus:outline-none text-black"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
