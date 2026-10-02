import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "../components/Card";
import { Link, useParams } from "react-router-dom";
import { RotateCw } from "lucide-react";
import { fetchProductByCategory } from "../store/slices/productSlice";

const CategoryPage = () => {
  const dispatch = useDispatch();
  const {
    categoryProducts,
    categoryProductsStatus,
    categoryProductsError,
  } = useSelector((state) => state.products);
  const { category } = useParams();
  const [availability, setAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");

  useEffect(() => {
    dispatch(fetchProductByCategory(category));
  }, [dispatch, category]);

  const visibleProducts = useMemo(() => {
    const filteredProducts = categoryProducts.filter((product) => {
      const isInStock = Number(product.stock ?? 0) > 0;
      return (
        availability === "all" ||
        (availability === "in-stock" && isInStock) ||
        (availability === "out-of-stock" && !isInStock)
      );
    });

    return filteredProducts.sort((left, right) => {
      if (sortBy === "price-asc") return Number(left.price) - Number(right.price);
      if (sortBy === "price-desc") return Number(right.price) - Number(left.price);
      const nameOrder = String(left.name).localeCompare(String(right.name));
      return sortBy === "name-desc" ? -nameOrder : nameOrder;
    });
  }, [availability, categoryProducts, sortBy]);

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

      <div className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 md:py-14 lg:px-12">
        <header className="mb-8 flex flex-col gap-6 border-b border-white/10 pb-7 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c6b2ff]">
              Vistyle / collection
            </p>
            <h1 className="mb-3 font-serif text-4xl font-light leading-tight tracking-[-0.04em] text-[#f4f1e9] sm:text-5xl">
              {category?.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}.
            </h1>
            <p className="mb-0 text-sm leading-6 text-white/55">
              Considered pieces, selected for your style.
            </p>
          </div>
          <p
            className="mb-0 text-xs tracking-wide text-white/55"
            aria-live="polite"
          >
            {visibleProducts.length} {visibleProducts.length === 1 ? "piece" : "pieces"}
          </p>
        </header>

        <div className="mb-6">
          <Link
            to="/products"
            className="text-xs font-medium tracking-wide text-white/60 underline decoration-white/20 underline-offset-4 transition hover:text-[#d9ccff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
          >
            Browse all collections
          </Link>
        </div>

        <section
          aria-label="Filter and sort collection"
          className="mb-8 grid gap-4 border border-white/10 bg-[#181815]/70 p-4 sm:grid-cols-2 sm:p-5 lg:flex lg:items-center lg:justify-between"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <label
              htmlFor="category-availability"
              className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55"
            >
              Availability
            </label>
            <select
              id="category-availability"
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
              className="min-h-11 border border-white/15 bg-[#1a191b] px-3 py-2 text-sm text-[#f4f1e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c6b2ff]"
            >
              <option value="all">All pieces</option>
              <option value="in-stock">In stock</option>
              <option value="out-of-stock">Out of stock</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <label
              htmlFor="category-sort"
              className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55"
            >
              Sort by
            </label>
            <select
              id="category-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="min-h-11 border border-white/15 bg-[#1a191b] px-3 py-2 text-sm text-[#f4f1e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c6b2ff]"
            >
              <option value="name-asc">Alphabetically, A–Z</option>
              <option value="name-desc">Alphabetically, Z–A</option>
              <option value="price-asc">Price, low to high</option>
              <option value="price-desc">Price, high to low</option>
            </select>
          </div>
        </section>

        {categoryProductsStatus === "idle" ||
        categoryProductsStatus === "loading" ? (
          <p
            role="status"
            aria-live="polite"
            className="border border-white/10 bg-[#181815]/70 py-16 text-center text-sm text-white/60"
          >
            Loading the collection...
          </p>
        ) : categoryProductsStatus === "failed" ? (
          <section
            role="alert"
            className="mx-auto max-w-2xl border border-rose-300/25 bg-rose-300/[0.06] p-6 text-center sm:p-8"
          >
            <h2 className="mb-2 font-serif text-2xl font-light text-[#f4f1e9]">
              This collection is unavailable.
            </h2>
            <p className="mb-5 text-sm leading-6 text-white/60">
              {categoryProductsError}
            </p>
            <button
              type="button"
              onClick={() => dispatch(fetchProductByCategory(category))}
              className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#c6b2ff] bg-[#c6b2ff] px-4 py-2 text-sm font-semibold text-[#17151b] transition hover:bg-[#d5c8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c6b2ff]"
            >
              <RotateCw size={15} aria-hidden="true" />
              Try again
            </button>
          </section>
        ) : visibleProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product) => (
              <div key={product._id} className="w-full min-w-0">
                <Card product={product} variant="vistyle" />
              </div>
            ))}
          </div>
        ) : (
          <section className="flex min-h-64 flex-col items-center justify-center border border-white/10 bg-[#181815]/70 px-6 py-12 text-center">
            <h2 className="mb-3 font-serif text-2xl font-light text-[#f4f1e9]">
              {categoryProducts.length === 0
                ? "Nothing in this collection yet."
                : "No pieces match these filters."}
            </h2>
            <p className="mb-5 max-w-md text-sm leading-6 text-white/55">
              {categoryProducts.length === 0
                ? "Explore the full Vistyle collection to find your next piece."
                : "Adjust your availability filter to see more pieces."}
            </p>
            {categoryProducts.length > 0 ? (
              <button
                type="button"
                onClick={() => setAvailability("all")}
                className="text-sm font-medium text-[#d9ccff] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
              >
                Clear filters
              </button>
            ) : (
              <Link
                to="/products"
                className="inline-flex min-h-11 items-center border border-[#c6b2ff] bg-[#c6b2ff] px-5 py-3 text-sm font-semibold text-[#17151b] no-underline transition hover:bg-[#d5c8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
              >
                Browse all pieces
              </Link>
            )}
          </section>
        )}
      </div>
    </main>
  );
};

export default CategoryPage;
