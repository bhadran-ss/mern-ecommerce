import React, { useRef, useState } from "react";
import { BsCartPlus, BsSearch } from "react-icons/bs";
import { Menu, X, XCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { logoutUser } from "../store/slices/authSlice";
import { clearSearchResult } from "../store/slices/productSlice";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/products" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const Header = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);
  const navigate = useNavigate();
  const dashboardPath =
    user?.role === "admin"
      ? "/secret-panel"
      : user?.role === "seller"
        ? "/seller-panel"
        : null;

  const handleSearch = (inputRef) => {
    const searchQuery = inputRef.current?.value.trim() || "";
    if (!searchQuery) {
      toast.error("Please enter a search term");
      return false;
    }

    dispatch(clearSearchResult());
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    setIsMobileOpen(false);
    setIsSearchOpen(false);
    return true;
  };

  const closeMobileMenu = () => setIsMobileOpen(false);
  const closeSearch = () => setIsSearchOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#11110f]/95 text-[#f4f1e9] shadow-[0_8px_32px_rgba(0,0,0,.18)] backdrop-blur-md">
      <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <Link
          to="/"
          aria-label="Vistyle home"
          className="group inline-flex shrink-0 items-center gap-3 text-[#f4f1e9] no-underline transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
        >
          <span className="grid h-9 w-9 place-items-center border border-[#c6b2ff]/70 font-serif text-lg text-[#d9ccff] transition group-hover:bg-[#c6b2ff]/10">
            V
          </span>
          <span className="text-xs font-semibold tracking-[0.28em]">
            VISTYLE
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 justify-center px-6 lg:flex">
          {isSearchOpen ? (
            <form
              role="search"
              className="flex w-full max-w-lg items-center gap-3 border-b border-white/20"
              onSubmit={(event) => {
                event.preventDefault();
                handleSearch(desktopSearchRef);
              }}
            >
              <BsSearch
                className="h-4 w-4 shrink-0 text-white/45"
                aria-hidden="true"
              />
              <input
                ref={desktopSearchRef}
                aria-label="Search products"
                type="search"
                autoFocus
                placeholder="Search the collection"
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm text-[#f4f1e9] placeholder:text-white/35 focus:outline-none focus:ring-0"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={closeSearch}
                className="rounded-sm p-1 text-white/55 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c6b2ff]"
              >
                <XCircle size={19} aria-hidden="true" />
              </button>
            </form>
          ) : (
            <nav aria-label="Main navigation" className="flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => {
                    if (item.label === "Shop") dispatch(clearSearchResult());
                  }}
                  className="group relative rounded-sm text-xs font-medium tracking-wide text-white/70 no-underline transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
                >
                  {item.label}
                  <span className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-[#c6b2ff] transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          {user ? (
            <>
              {user.role === "customer" && (
                <Link
                  to="/orders"
                  className="hidden rounded-sm text-xs font-medium text-white/70 no-underline transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff] md:block"
                >
                  My orders
                </Link>
              )}
              <button
                type="button"
                onClick={() => dispatch(logoutUser())}
                className="hidden rounded-sm text-xs font-medium text-white/70 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff] md:block"
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="hidden items-center gap-3 text-xs md:flex">
              <Link
                to="/register"
                className="rounded-sm text-white/70 no-underline transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
              >
                Register
              </Link>
              <span aria-hidden="true" className="text-white/25">
                /
              </span>
              <Link
                to="/login"
                className="rounded-sm text-white/70 no-underline transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
              >
                Sign in
              </Link>
            </div>
          )}

          {dashboardPath && (
            <Link
              to={dashboardPath}
              className="hidden rounded-sm text-xs font-medium text-[#d9ccff] no-underline transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff] md:block"
            >
              {user.role === "admin" ? "Admin" : "Seller"}
            </Link>
          )}

          <button
            type="button"
            aria-label={isSearchOpen ? "Close search" : "Search"}
            aria-expanded={isSearchOpen}
            onClick={() => {
              setIsSearchOpen((open) => !open);
              setIsMobileOpen(false);
            }}
            className="rounded-sm p-1 text-white/75 transition hover:text-[#d9ccff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
          >
            {isSearchOpen ? (
              <XCircle size={19} aria-hidden="true" />
            ) : (
              <BsSearch className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <Link
            to="/cart"
            aria-label={`Cart${cart.length > 0 ? `, ${cart.length} items` : ""}`}
            className="relative rounded-sm p-1 text-white/75 no-underline transition hover:text-[#d9ccff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
          >
            <BsCartPlus className="h-5 w-5" aria-hidden="true" />
            {cart.length > 0 && (
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center border border-[#11110f] bg-[#c6b2ff] px-1 text-[10px] font-semibold text-[#17151b]">
                {cart.length > 99 ? "99+" : cart.length}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="rounded-sm p-1 text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff] lg:hidden"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => {
              setIsMobileOpen((open) => !open);
              setIsSearchOpen(false);
            }}
          >
            {isMobileOpen ? (
              <X size={21} aria-hidden="true" />
            ) : (
              <Menu size={21} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-white/10 bg-[#151513] lg:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col px-5 py-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => {
                  closeMobileMenu();
                  if (item.label === "Shop") dispatch(clearSearchResult());
                }}
                className="border-b border-white/[0.07] py-4 text-sm text-white/75 no-underline transition hover:text-[#d9ccff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#c6b2ff]"
              >
                {item.label}
              </Link>
            ))}
            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="border-b border-white/[0.07] py-4 text-sm text-white/75 no-underline hover:text-[#d9ccff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#c6b2ff]"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="border-b border-white/[0.07] py-4 text-sm text-white/75 no-underline hover:text-[#d9ccff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#c6b2ff]"
                >
                  Create account
                </Link>
              </>
            ) : (
              <>
                {dashboardPath && (
                  <Link
                    to={dashboardPath}
                    onClick={closeMobileMenu}
                    className="border-b border-white/[0.07] py-4 text-sm text-white/75 no-underline hover:text-[#d9ccff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#c6b2ff]"
                  >
                    {user.role === "admin" ? "Admin panel" : "Seller studio"}
                  </Link>
                )}
                {user.role === "customer" && (
                  <Link
                    to="/orders"
                    onClick={closeMobileMenu}
                    className="border-b border-white/[0.07] py-4 text-sm text-white/75 no-underline hover:text-[#d9ccff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#c6b2ff]"
                  >
                    My orders
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    dispatch(logoutUser());
                    closeMobileMenu();
                  }}
                  className="py-4 text-left text-sm text-rose-200 transition hover:text-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-rose-200"
                >
                  Sign out
                </button>
              </>
            )}
          </nav>
        </div>
      )}

      {isSearchOpen && (
        <div className="border-t border-white/10 bg-[#151513] px-5 py-4 lg:hidden">
          <form
            role="search"
            className="mx-auto flex max-w-2xl items-center gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              handleSearch(mobileSearchRef);
            }}
          >
            <input
              ref={mobileSearchRef}
              aria-label="Search products"
              type="search"
              autoFocus
              placeholder="Search the collection"
              className="min-h-11 min-w-0 flex-1 border border-white/15 bg-white/[0.045] px-4 py-2 text-sm text-[#f4f1e9] placeholder:text-white/35 focus:border-[#c6b2ff]/80 focus:outline-none focus:ring-2 focus:ring-[#c6b2ff]/20"
            />
            <button
              type="submit"
              className="min-h-11 border border-[#c6b2ff] bg-[#c6b2ff] px-4 text-xs font-semibold text-[#17151b] transition hover:bg-[#d5c8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c6b2ff]"
            >
              Search
            </button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;
