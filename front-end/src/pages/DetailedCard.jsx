import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, RotateCw } from "lucide-react";
import { fetchProduct } from "../store/slices/productSlice";
import { addToCart as addToCartThunk } from "../store/slices/cartSlice";

const DetailedCard = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const {
    detailedProduct,
    detailedProductStatus,
    detailedProductError,
  } = useSelector((state) => state.products);
  const stockLeft = Number(detailedProduct?.stock ?? 0);
  const isOutOfStock = stockLeft <= 0;

  useEffect(() => {
    dispatch(fetchProduct(id));
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (!detailedProduct) return;

    if (!user) {
      navigate(`/login?returnTo=${encodeURIComponent("/cart")}`);
      return;
    }

    if (isOutOfStock) {
      return;
    }

    dispatch(addToCartThunk(detailedProduct));
  };

  if (detailedProductStatus === "loading" || detailedProductStatus === "idle") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mx-auto my-16 max-w-3xl border border-white/10 bg-[#181815]/70 p-8 text-center text-sm text-white/60"
      >
        Loading product details...
      </div>
    );
  }

  if (detailedProductStatus === "failed" || !detailedProduct) {
    return (
      <main className="relative isolate mx-auto my-10 w-full max-w-3xl px-4 text-[#f4f1e9] sm:px-6">
        <section
          role="alert"
          className="border border-rose-300/25 bg-[#181815]/80 p-6 text-center sm:p-10"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-200">
            Product unavailable
          </p>
          <h1 className="mb-3 font-serif text-3xl font-light text-[#f4f1e9]">
            We couldn’t load this product.
          </h1>
          <p className="mb-6 text-sm text-white/60">
            {detailedProductError || "The product may have been removed."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => dispatch(fetchProduct(id))}
              className="inline-flex min-h-11 items-center gap-2 border border-[#c6b2ff] bg-[#c6b2ff] px-4 py-2 text-sm font-semibold text-[#17151b] transition hover:bg-[#d5c8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c6b2ff]"
            >
              <RotateCw size={15} aria-hidden="true" />
              Try again
            </button>
            <Link
              to="/products"
              className="inline-flex min-h-11 items-center gap-2 border border-white/15 px-4 py-2 text-sm font-medium text-white/70 no-underline transition hover:bg-white/[0.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c6b2ff]"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              Back to products
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative isolate flex-1 overflow-hidden bg-[#11110f] px-4 py-8 text-[#f4f1e9] selection:bg-[#c6b2ff] selection:text-[#17151b] sm:px-6 sm:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-52 -top-48 h-[34rem] w-[34rem] rounded-full bg-[#7b61a8]/20 blur-[120px]" />
        <div className="absolute -bottom-56 right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-[#555f44]/15 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>
      <div className="mx-auto w-full max-w-[1440px]">
      <Link
        to="/products"
        className="mb-6 inline-flex items-center gap-2 text-xs font-medium tracking-wide text-white/60 no-underline transition hover:text-[#d9ccff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to products
      </Link>
      <article className="border border-white/10 bg-[#181815]/75 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="min-w-0 flex-1 border border-white/10 bg-white/[0.025] p-2 sm:p-4">
          <img
            src={detailedProduct.image}
            alt={detailedProduct.name}
            className="max-h-[500px] w-full object-contain"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-6">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c6b2ff]">
            Vistyle / product
          </p>
          <h1 className="font-serif text-3xl font-light leading-tight tracking-[-0.04em] text-[#f4f1e9] sm:text-4xl">
            {detailedProduct.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-lg">
            <span className="font-medium text-[#f4f1e9]">
            ₹ {Number(detailedProduct.price).toFixed(2)}
            </span>
            {detailedProduct.isFeatured && (
            <span className="border border-[#c6b2ff]/25 bg-[#c6b2ff]/[0.08] px-2 py-1 text-xs font-medium text-[#d9ccff]">
              Featured
              </span>
            )}
            <span
              className={`border px-2 py-1 text-xs font-semibold ${
                isOutOfStock
                  ? "border-rose-300/25 bg-rose-300/[0.08] text-rose-200"
                  : "border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-200"
              }`}
            >
              {isOutOfStock ? "Out of stock" : `${stockLeft} in stock`}
            </span>
          </div>

          <div>
            <h2 className="mb-2 font-serif text-xl font-light text-[#f4f1e9]">
              Description
            </h2>
            <p className="text-sm leading-7 text-white/60">
              {detailedProduct.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`min-h-12 border px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff] ${
                isOutOfStock
                  ? "border-white/10 bg-white/[0.04] text-white/35 cursor-not-allowed"
                  : "border-[#c6b2ff] bg-[#c6b2ff] text-[#17151b] hover:bg-[#d5c8ff]"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
      </article>
      </div>
    </main>
  );
};

export default DetailedCard;
