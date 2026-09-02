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
        className="mx-auto my-16 max-w-3xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600"
      >
        Loading product details...
      </div>
    );
  }

  if (detailedProductStatus === "failed" || !detailedProduct) {
    return (
      <main className="mx-auto my-10 w-full max-w-3xl px-4 sm:px-6">
        <section
          role="alert"
          className="border border-rose-200 bg-white p-6 text-center shadow-sm sm:p-10"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
            Product unavailable
          </p>
          <h1 className="mb-3 text-2xl font-semibold text-gray-900">
            We couldn’t load this product.
          </h1>
          <p className="mb-6 text-sm text-gray-600">
            {detailedProductError || "The product may have been removed."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => dispatch(fetchProduct(id))}
              className="inline-flex min-h-11 items-center gap-2 border border-gray-800 px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              <RotateCw size={15} aria-hidden="true" />
              Try again
            </button>
            <Link
              to="/products"
              className="inline-flex min-h-11 items-center gap-2 border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 no-underline transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
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
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        to="/products"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 no-underline transition hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to products
      </Link>
      <article className="border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="min-w-0 flex-1">
          <img
            src={detailedProduct.image}
            alt={detailedProduct.name}
            className="w-full max-h-[500px] object-contain rounded-lg"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {detailedProduct.name}
          </h1>

          <div className="flex items-center gap-3 text-lg flex-wrap">
            <span className="font-semibold text-gray-900">
            ₹ {Number(detailedProduct.price).toFixed(2)}
            </span>
            {detailedProduct.isFeatured && (
            <span className="border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-medium text-violet-800">
              Featured
              </span>
            )}
            <span
              className={`border px-2 py-1 text-xs font-semibold ${
                isOutOfStock
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              {isOutOfStock ? "Out of stock" : `${stockLeft} in stock`}
            </span>
          </div>

          <div>
            <h2 className="mb-1 text-base font-medium text-gray-900">
              Description
            </h2>
            <p className="text-sm text-gray-600">
              {detailedProduct.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`px-6 py-3 rounded-full transition ${
                isOutOfStock
                  ? "border border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "border border-black text-black hover:bg-black hover:text-white"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
      </article>
    </main>
  );
};

export default DetailedCard;
