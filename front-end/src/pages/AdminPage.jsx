import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, RotateCw } from "lucide-react";
import { Link } from "react-router-dom";
import ManageProducts from "../components/ManageProducts";
import AddProduct from "../components/AddProduct";
import { fetchAllProducts } from "../store/slices/productSlice";

const adminTabs = [
  { id: "manageProducts", label: "Catalog" },
  { id: "addProduct", label: "Add product" },
];

const AdminPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("manageProducts");
  const { products, allProductsStatus, allProductsError } = useSelector(
    (state) => state.products,
  );

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  return (
    <main className="relative isolate min-h-screen flex-1 overflow-hidden bg-[#11110f] text-[#f4f1e9] selection:bg-[#c6b2ff] selection:text-[#17151b]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-52 -top-48 h-[34rem] w-[34rem] rounded-full bg-[#7b61a8]/20 blur-[120px]" />
        <div className="absolute -bottom-56 right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-[#555f44]/15 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 sm:px-8 lg:px-12">
        <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10">
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
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-white/70 no-underline transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
          >
            <ArrowLeft size={14} aria-hidden="true" /> Back to shop
          </Link>
        </header>

        <div className="relative flex-1 py-10 md:py-14 xl:py-16">
          <section className="mb-8 flex flex-wrap items-end justify-between gap-6 md:mb-10">
            <div className="max-w-3xl">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c6b2ff]">
                Vistyle / administration
              </p>
              <h1 className="mb-3 font-serif text-4xl font-light leading-tight tracking-[-0.04em] text-[#f4f1e9] sm:text-5xl">
                Catalog studio.
              </h1>
              <p className="mb-0 text-sm leading-6 text-white/75">
                Curate the store’s full collection and publish new products.
              </p>
            </div>
            <div className="flex w-full items-center justify-between gap-5 border border-white/10 bg-[#181815]/70 px-4 py-3 sm:w-auto sm:justify-start sm:px-5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                Catalog items
              </span>
              <span
                aria-label={`${products.length} catalog products`}
                className="font-serif text-2xl text-[#f4f1e9]"
              >
                {products.length}
              </span>
            </div>
          </section>

          <section
            aria-label="Administrator catalog workspace"
            className="overflow-hidden border border-white/10 bg-[#181815]/70"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
              <div
                role="group"
                aria-label="Catalog actions"
                className="flex flex-wrap gap-2"
              >
                {adminTabs.map(({ id, label }) => {
                  const isActive = activeTab === id;
                  return (
                    <button
                      key={id}
                      id={`admin-tab-${id}`}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setActiveTab(id)}
                      className={`inline-flex min-h-11 items-center gap-2 border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c6b2ff] ${
                        isActive
                          ? "border-[#c6b2ff] bg-[#c6b2ff] text-[#17151b]"
                          : "border-white/15 bg-white/[0.035] text-white/75 hover:border-white/30 hover:bg-white/[0.07] hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => dispatch(fetchAllProducts())}
                disabled={allProductsStatus === "loading"}
                className="inline-flex min-h-11 items-center gap-2 border border-white/15 px-4 py-2 text-sm font-medium text-white/75 transition hover:border-[#c6b2ff]/60 hover:bg-[#c6b2ff]/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c6b2ff] disabled:cursor-wait disabled:opacity-60"
              >
                <RotateCw
                  size={15}
                  aria-hidden="true"
                  className={
                    allProductsStatus === "loading" ? "animate-spin" : ""
                  }
                />
                {allProductsStatus === "loading"
                  ? "Refreshing..."
                  : "Refresh catalog"}
              </button>
            </div>

            <div
              id="admin-tab-panel"
              role="region"
              aria-label={
                activeTab === "manageProducts" ? "Catalog products" : "Add product"
              }
              aria-labelledby={`admin-tab-${activeTab}`}
              className="p-4 sm:p-6 lg:p-8"
            >
              {allProductsError && (
                <div
                  role="alert"
                  className="mb-6 border border-rose-300/25 bg-rose-300/[0.08] p-4 text-sm text-rose-100"
                >
                  {allProductsError}
                </div>
              )}

              {activeTab === "manageProducts" ? (
                allProductsStatus === "loading" && products.length === 0 ? (
                  <p
                    role="status"
                    className="border border-white/10 bg-white/[0.025] p-8 text-center text-sm text-white/75"
                  >
                    Loading catalog...
                  </p>
                ) : allProductsStatus === "failed" && products.length === 0 ? (
                  <div className="border border-white/10 bg-white/[0.025] p-8 text-center">
                    <p className="mb-0 text-sm leading-6 text-white/75">
                      The catalog could not be loaded. Use “Refresh catalog” to
                      try again.
                    </p>
                  </div>
                ) : (
                  <ManageProducts canFeature variant="admin" />
                )
              ) : (
                <AddProduct variant="admin" />
              )}
            </div>
          </section>
        </div>

        <footer className="flex min-h-12 items-center justify-between border-t border-white/10 text-[10px] tracking-wide text-white/35">
          <span>VISTYLE</span>
          <span>Administration</span>
        </footer>
      </div>
    </main>
  );
};

export default AdminPage;
