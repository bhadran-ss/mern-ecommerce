import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, RotateCw, X } from "lucide-react";
import AccountLayout from "../components/AccountLayout";
import AddProduct from "../components/AddProduct";
import ManageProducts from "../components/ManageProducts";
import { fetchSellerProducts } from "../store/slices/productSlice";

const SellerPage = () => {
  const dispatch = useDispatch();
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const {
    sellerProducts: products,
    sellerProductsLoading,
    sellerProductsError,
  } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchSellerProducts());
  }, [dispatch]);

  return (
    <AccountLayout role="seller" footerLabel="Seller studio">
        <div className="relative py-10 md:py-14 xl:py-16">
          <section className="mb-8 flex flex-wrap items-end justify-between gap-6 md:mb-10">
            <div className="max-w-2xl">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c6b2ff]">
                Vistyle / seller studio
              </p>
              <h1 className="mb-3 font-serif text-4xl font-light leading-tight tracking-[-0.04em] text-[#f4f1e9] sm:text-5xl">
                Your collection.
              </h1>
              <p className="mb-0 text-sm leading-6 text-white/75">
                Keep your listings in view and add a new piece whenever you’re
                ready.
              </p>
            </div>
            <div className="flex w-full items-center justify-between gap-4 border border-white/10 bg-[#181815]/70 px-4 py-3 sm:w-auto sm:justify-start sm:px-5">
              <span className="text-xs tracking-wide text-white/75">
                Active listings
              </span>
              <span className="font-serif text-xl text-[#f4f1e9]">
                {products.length}
              </span>
            </div>
          </section>

          <section className="mt-6 border border-white/10 bg-[#181815]/65">
            <button
              type="button"
              aria-expanded={isCreatingListing}
              aria-controls="seller-listing-form"
              onClick={() => setIsCreatingListing((isOpen) => !isOpen)}
              className="group flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-white/[0.035] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#c6b2ff] sm:px-7"
            >
              <span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c6b2ff]">
                  {isCreatingListing ? "Close listing form" : "Grow your collection"}
                </span>
                <span className="mt-1 block font-serif text-xl font-light text-[#f4f1e9] sm:text-2xl">
                  {isCreatingListing ? "Back to your listings." : "Add a new listing."}
                </span>
              </span>
              <span className="grid h-11 w-11 shrink-0 place-items-center border border-[#c6b2ff]/50 text-[#d9ccff] transition group-hover:bg-[#c6b2ff]/10">
                {isCreatingListing ? (
                  <X size={18} aria-hidden="true" />
                ) : (
                  <Plus size={18} aria-hidden="true" />
                )}
              </span>
            </button>
            <div
              id="seller-listing-form"
              hidden={!isCreatingListing}
              className="border-t border-white/10 px-4 py-5 sm:px-7 sm:py-7"
            >
              <AddProduct
                variant="seller"
                onCreated={() => setIsCreatingListing(false)}
              />
            </div>
          </section>

          <section aria-label="Seller product listings" className="mt-6">
            {sellerProductsError ? (
              <div
                role="alert"
                className="border border-rose-300/25 bg-rose-400/[0.08] p-6"
              >
                <h2 className="mb-2 font-serif text-xl font-light text-[#f4f1e9]">
                  Your listings couldn’t be loaded.
                </h2>
                <p className="mb-5 text-sm leading-6 text-white/75">
                  {sellerProductsError}
                </p>
                <button
                  type="button"
                  onClick={() => dispatch(fetchSellerProducts())}
                  disabled={sellerProductsLoading}
                  className="inline-flex items-center gap-2 border border-[#c6b2ff]/60 px-4 py-2 text-sm font-medium text-[#e3d8ff] transition hover:bg-[#c6b2ff]/10 disabled:cursor-wait disabled:opacity-60"
                >
                  <RotateCw size={15} aria-hidden="true" />
                  Try again
                </button>
              </div>
            ) : sellerProductsLoading && products.length === 0 ? (
              <p role="status" className="border border-white/10 bg-[#181815]/65 p-6 text-center text-sm text-white/75">
                Loading your listings...
              </p>
            ) : (
              <>
                {sellerProductsLoading && (
                  <p role="status" className="mb-3 text-sm text-white/75">
                    Refreshing your listings...
                  </p>
                )}
                <ManageProducts items={products} variant="seller" />
              </>
            )}
          </section>
        </div>

    </AccountLayout>
  );
};

export default SellerPage;
