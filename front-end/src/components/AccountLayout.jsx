import { LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import { logoutUser } from "../store/slices/authSlice";

const accountDestinations = {
  customer: { label: "Order history", path: "/orders" },
  seller: { label: "Seller studio", path: "/seller-panel" },
  admin: { label: "Catalog admin", path: "/secret-panel" },
};

const AccountLayout = ({ role, children, footerLabel }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const destination = accountDestinations[role];

  return (
    <main className="relative isolate flex-1 overflow-hidden bg-[#11110f] text-[#f4f1e9] selection:bg-[#c6b2ff] selection:text-[#17151b]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-52 -top-48 h-[34rem] w-[34rem] rounded-full bg-[#7b61a8]/20 blur-[120px]" />
        <div className="absolute -bottom-56 right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-[#555f44]/15 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 sm:px-8 lg:px-12">
        <header className="flex min-h-[76px] flex-wrap items-center justify-between gap-4 border-b border-white/10 py-4">
          <Link
            to="/"
            aria-label="Vistyle home"
            className="group inline-flex items-center gap-3 text-[#f4f1e9] no-underline transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
          >
            <span className="grid h-9 w-9 place-items-center border border-[#c6b2ff]/70 font-serif text-lg text-[#d9ccff] transition group-hover:bg-[#c6b2ff]/10">
              V
            </span>
            <span className="text-xs font-semibold tracking-[0.28em]">
              VISTYLE
            </span>
          </Link>

          <nav
            aria-label="Account navigation"
            className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2"
          >
            <NavLink
              to={destination.path}
              end
              aria-current="page"
              className="text-xs font-medium tracking-wide text-[#d9ccff] underline decoration-[#c6b2ff]/50 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
            >
              {destination.label}
            </NavLink>
            <Link
              to="/products"
              className="text-xs font-medium tracking-wide text-white/70 no-underline transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
            >
              Shop
            </Link>
            {user && (
              <button
                type="button"
                onClick={() => dispatch(logoutUser())}
                className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-white/70 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
              >
                <LogOut size={14} aria-hidden="true" />
                Sign out
              </button>
            )}
          </nav>
        </header>

        <div className="relative flex-1">{children}</div>

        <footer className="flex min-h-12 items-center justify-between border-t border-white/10 text-[10px] tracking-wide text-white/45">
          <span>VISTYLE</span>
          <span>{footerLabel}</span>
        </footer>
      </div>
    </main>
  );
};

export default AccountLayout;
