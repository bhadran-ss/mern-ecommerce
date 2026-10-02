import { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RotateCw } from "lucide-react";
import AccountLayout from "../components/AccountLayout";
import ManageProducts from "../components/ManageProducts";
import AddProduct from "../components/AddProduct";
import { fetchAllProducts } from "../store/slices/productSlice";
import SellerApplications from "../components/SellerApplications";

const CategoryManagement = lazy(
  () => import("../components/CategoryManagement"),
);

const adminTabs = [
  { id: "manageProducts", label: "Catalog" },
  { id: "addProduct", label: "Add product" },
  { id: "sellerApplications", label: "Seller applications" },
  { id: "categories", label: "Categories" },
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
    <AccountLayout role="admin" footerLabel="Administration">
        <div className="py-10 md:py-14 xl:py-16">
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
                activeTab === "manageProducts"
                  ? "Catalog products"
                  : activeTab === "addProduct"
                    ? "Add product"
                    : activeTab === "sellerApplications"
                      ? "Seller applications"
                      : "Category management"
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
              ) : activeTab === "addProduct" ? (
                <AddProduct variant="admin" />
              ) : activeTab === "sellerApplications" ? (
                <SellerApplications />
              ) : (
                <Suspense
                  fallback={
                    <p role="status" className="text-sm text-white/60">
                      Loading category tools...
                    </p>
                  }
                >
                  <CategoryManagement />
                </Suspense>
              )}
            </div>
          </section>
        </div>

    </AccountLayout>
  );
};

export default AdminPage;
