import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RotateCw } from "lucide-react";
import { useLocation } from "react-router-dom";
import Card from "../components/Card";
import {
  fetchAllProducts,
  getSearchResult,
} from "../store/slices/productSlice";

const AllProducts = () => {
  const dispatch = useDispatch();
  const {
    products,
    searchResult,
    allProductsStatus,
    allProductsError,
    searchStatus,
    searchError,
  } = useSelector((state) => state.products);
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get("search")?.trim();
  const isSearchActive = Boolean(searchQuery);
  const displayProducts = isSearchActive ? searchResult : products;
  const status = isSearchActive ? searchStatus : allProductsStatus;
  const error = isSearchActive ? searchError : allProductsError;

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  useEffect(() => {
    if (isSearchActive) {
      dispatch(getSearchResult(searchQuery));
    }
  }, [dispatch, isSearchActive, searchQuery]);

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

      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 md:py-14 lg:px-12">
        <header className="mb-8 border-b border-white/10 pb-7 sm:mb-10">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c6b2ff]">
            Vistyle / {isSearchActive ? "search" : "collection"}
          </p>
          <h1 className="mb-3 font-serif text-4xl font-light leading-tight tracking-[-0.04em] text-[#f4f1e9] sm:text-5xl">
            {isSearchActive ? "Search results." : "The collection."}
          </h1>
          <p className="mb-0 text-sm leading-6 text-white/55">
            {isSearchActive
              ? `Pieces matching “${searchQuery}”.`
              : "Considered pieces, selected for your style."}
          </p>
        </header>

        {status === "idle" || status === "loading" ? (
          <p
            role="status"
            aria-live="polite"
            className="border border-white/10 bg-[#181815]/70 py-16 text-center text-sm text-white/60"
          >
            {isSearchActive ? "Searching the collection..." : "Loading the collection..."}
          </p>
        ) : error ? (
          <section
            role="alert"
            className="mx-auto max-w-2xl border border-rose-300/25 bg-rose-300/[0.06] p-6 text-center sm:p-8"
          >
            <h2 className="mb-2 font-serif text-2xl font-light text-[#f4f1e9]">
              {isSearchActive
                ? "Search is temporarily unavailable."
                : "The collection is unavailable."}
            </h2>
            <p className="mb-5 text-sm leading-6 text-white/60">{error}</p>
            <button
              type="button"
              onClick={() =>
                dispatch(
                  isSearchActive
                    ? getSearchResult(searchQuery)
                    : fetchAllProducts(),
                )
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#c6b2ff] bg-[#c6b2ff] px-4 py-2 text-sm font-semibold text-[#17151b] transition hover:bg-[#d5c8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c6b2ff]"
            >
              <RotateCw size={15} aria-hidden="true" />
              Try again
            </button>
          </section>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {displayProducts.map((product) => (
              <div key={product._id} className="w-full min-w-0">
                <Card product={product} variant="vistyle" />
              </div>
            ))}
          </div>
        ) : (
          <section className="flex min-h-64 flex-col items-center justify-center border border-white/10 bg-[#181815]/70 px-6 py-12 text-center">
            <h2 className="mb-3 font-serif text-2xl font-light text-[#f4f1e9]">
              {isSearchActive
                ? "No pieces match that search."
                : "Nothing in the collection yet."}
            </h2>
            <p className="mb-0 max-w-md text-sm leading-6 text-white/55">
              {isSearchActive
                ? "Try a different search term to discover more."
                : "Please check back soon for new arrivals."}
            </p>
          </section>
        )}
      </div>
    </main>
  );
};

export default AllProducts;
