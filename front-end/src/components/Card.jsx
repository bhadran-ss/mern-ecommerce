import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiCartAdd } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { addToCart as addToCartThunk } from "../store/slices/cartSlice";

const Card = ({ product, variant = "default" }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isThemed = variant === "vistyle";
  const stockLeft = Number(product.stock ?? 0);
  const isOutOfStock = stockLeft <= 0;

  const handleAddToCart = () => {
    if (!user) {
      navigate(`/login?returnTo=${encodeURIComponent("/cart")}`);
      return;
    }

    if (isOutOfStock) {
      toast.error("This product is currently out of stock.", { id: "stock" });
      return;
    }

    dispatch(addToCartThunk(product));
  };

  return (
    <article
      className={`flex min-h-[360px] w-full min-w-0 flex-col items-center justify-between p-3 transition duration-300 sm:min-h-[420px] sm:p-4 ${
        isThemed
          ? "border border-white/10 bg-[#181815]/80 hover:border-[#c6b2ff]/30 hover:bg-[#1d1c19]"
          : "rounded-lg bg-white shadow hover:shadow-lg"
      }`}
    >
      <Link
        to={`/product/${product._id}`}
        aria-label={`View ${product.name}`}
        className={`mb-3 block aspect-square w-full overflow-hidden transition-transform duration-300 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mb-4 ${
          isThemed
            ? "bg-white/[0.035] focus-visible:outline-[#c6b2ff]"
            : "rounded-md focus-visible:outline-black"
        }`}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300"
        />
      </Link>

      <div className="text-center mt-2 w-full">
        <h3
          className={`mb-1 line-clamp-2 text-lg font-medium ${
            isThemed ? "text-[#f4f1e9]" : "text-gray-800"
          }`}
        >
          <Link
            to={`/product/${product._id}`}
            className={`rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
              isThemed
                ? "text-[#f4f1e9] no-underline transition hover:text-[#d9ccff] focus-visible:outline-[#c6b2ff]"
                : "text-gray-800 focus-visible:outline-black"
            }`}
          >
          {product.name}
          </Link>
        </h3>
        <p className={isThemed ? "text-white/65" : "text-gray-600"}>
          ₹ {Number(product.price).toFixed(2)}
        </p>
        <p
          role="status"
          className={`mt-2 text-xs font-semibold ${
            isThemed
              ? isOutOfStock
                ? "text-rose-200"
                : "text-emerald-200"
              : isOutOfStock
                ? "text-red-600"
                : "text-green-600"
          }`}
        >
          {isOutOfStock
            ? "Out of stock"
            : `${stockLeft} item${stockLeft === 1 ? "" : "s"} left`}
        </p>
      </div>

      <div className="mt-4 flex justify-center w-full">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          aria-label={
            isOutOfStock
              ? `${product.name} is out of stock`
              : `Add ${product.name} to cart`
          }
          className={`flex w-full max-w-[220px] items-center justify-center gap-2 px-4 py-2 text-sm rounded-full transition ${
            isOutOfStock
              ? isThemed
                ? "border border-white/10 bg-white/[0.04] text-white/35 cursor-not-allowed"
                : "border border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
              : isThemed
                ? "border border-[#c6b2ff]/60 text-[#e3d8ff] hover:bg-[#c6b2ff] hover:text-[#17151b]"
                : "border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
          }`}
        >
          <BiCartAdd size={18} aria-hidden="true" />
          {isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
        </button>
      </div>
    </article>
  );
};

export default Card;
