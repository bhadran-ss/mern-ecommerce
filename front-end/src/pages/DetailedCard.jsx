import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProduct } from "../store/slices/productSlice";
import { addToCart as addToCartThunk } from "../store/slices/cartSlice";

const DetailedCard = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { detailedProduct } = useSelector((state) => state.products);
  const stockLeft = Number(detailedProduct?.stock ?? 0);
  const isOutOfStock = stockLeft <= 0;

  useEffect(() => {
    dispatch(fetchProduct(id));
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (!detailedProduct) return;

    if (isOutOfStock) {
      return;
    }

    dispatch(addToCartThunk(detailedProduct));
  };

  if (!detailedProduct) {
    return (
      <div
        id="preloader"
        className="fixed inset-0 flex items-center justify-center bg-white z-50"
      >
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-16 p-6 bg-white shadow-lg rounded-xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Product Image */}
        <div className="flex-1">
          <img
            src={detailedProduct.image}
            alt={detailedProduct.name}
            className="w-full max-h-[500px] object-contain rounded-lg"
          />
        </div>

        {/* Right: Product Info */}
        <div className="flex-1 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {detailedProduct.name}
          </h1>

          <div className="flex items-center gap-3 text-lg flex-wrap">
            <span className="text-gray-700 font-semibold">
              Rs. {detailedProduct.price}
            </span>
            {detailedProduct.isFeatured && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Sale
              </span>
            )}
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                isOutOfStock
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {isOutOfStock ? "Out of stock" : `${stockLeft} in stock`}
            </span>
          </div>

          <div>
            <h2 className="text-md font-medium mb-1 text-gray-700">
              Description
            </h2>
            <p className="text-sm text-gray-600">
              {detailedProduct.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
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

          <div>
            <a
              href="#"
              className="text-sm text-blue-600 underline hover:text-blue-800"
            >
              More payment options
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedCard;
