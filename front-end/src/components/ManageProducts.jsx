import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Star, Trash } from "lucide-react";
import {
  toggleFeatured,
  deleteProduct as deleteProductThunk,
} from "../store/slices/productSlice";

const ManageProducts = ({ canFeature = false, items, variant = "default" }) => {
  const dispatch = useDispatch();
  const storedProducts = useSelector((state) => state.products.products);
  const products = items ?? storedProducts;
  const isSellerVariant = variant === "seller";
  if (products.length === 0) {
    return (
      <div
        className={`p-6 ${
          isSellerVariant
            ? "border border-white/10 bg-[#181815]/65"
            : "mx-auto mt-10 max-w-6xl rounded-xl bg-white shadow"
        }`}
      >
        <h2
          className={`mb-3 text-center ${
            isSellerVariant
              ? "font-serif text-2xl font-light text-[#f4f1e9]"
              : "text-2xl font-semibold"
          }`}
        >
          No products to manage yet.
        </h2>
        <p
          className={`mb-0 text-center text-sm ${
            isSellerVariant ? "text-white/75" : "text-gray-600"
          }`}
        >
          Use “Add a new listing” to publish your first product.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`p-4 sm:p-6 ${
        isSellerVariant
          ? "border border-white/10 bg-[#181815]/65"
          : "mx-auto mt-10 max-w-6xl rounded-xl bg-white shadow"
      }`}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2
          className={`mb-0 ${
            isSellerVariant
              ? "font-serif text-2xl font-light text-[#f4f1e9]"
              : "text-2xl font-semibold"
          }`}
        >
          {isSellerVariant ? "Your listings" : "View Products"}
        </h2>
        <span
          className={`text-xs tracking-wide ${
            isSellerVariant ? "text-white/75" : "text-gray-500"
          }`}
        >
          {products.length} {products.length === 1 ? "product" : "products"}
        </span>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table
          className={`min-w-full table-auto border text-left text-sm ${
            isSellerVariant
              ? "border-white/10 text-white/75"
              : "border-gray-200 text-gray-700"
          }`}
        >
          <thead
            className={`uppercase text-xs tracking-wide ${
              isSellerVariant
                ? "bg-white/[0.04] text-white/75"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price (₹)</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Image</th>
              {canFeature && <th className="px-4 py-3">Featured</th>}
              <th className="px-4 py-3">Delete</th>
            </tr>
          </thead>
          <tbody
            className={
              isSellerVariant ? "text-white/85" : "text-gray-700"
            }
          >
            {products.map((product) => (
              <tr
                key={product._id}
                className={`border-t transition ${
                  isSellerVariant
                    ? "border-white/10 hover:bg-white/[0.035]"
                    : "hover:bg-gray-100"
                }`}
              >
                <td className="px-4 py-3">{product.name}</td>
                <td className="px-4 py-3 capitalize">{product.category}</td>
                <td className="px-4 py-3">₹ {product.price.toFixed(2)}</td>
                <td className="px-4 py-3">{product.stock ?? 0}</td>
                <td className="px-4 py-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                {canFeature && (
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      aria-label={`${product.isFeatured ? "Remove featured status from" : "Feature"} ${product.name}`}
                      onClick={() => dispatch(toggleFeatured(product._id))}
                      className={`p-2 rounded-full transition ${
                        product.isFeatured
                          ? "bg-yellow-400 hover:bg-yellow-500"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    >
                      <Star size={20} className="text-white" aria-hidden="true" />
                    </button>
                  </td>
                )}
                <td className="px-4 py-3">
                  <button
                    type="button"
                    aria-label={`Delete ${product.name}`}
                    onClick={() => dispatch(deleteProductThunk(product._id))}
                    className={`p-2 text-white transition ${
                      isSellerVariant
                        ? "border border-rose-300/20 bg-rose-400/10 hover:bg-rose-400/20"
                        : "rounded-full bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    <Trash size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:hidden">
        {products.map((product) => (
          <div
            key={product._id}
            className={`border p-4 ${
              isSellerVariant
                ? "border-white/10 bg-white/[0.025]"
                : "rounded-lg border-gray-200 shadow-sm"
            }`}
          >
            <div className="flex items-center gap-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="min-w-0 flex-1">
                <h3
                  className={`text-sm font-semibold ${
                    isSellerVariant ? "text-[#f4f1e9]" : "text-gray-800"
                  }`}
                >
                  {product.name}
                </h3>
                <p
                  className={`text-xs capitalize ${
                    isSellerVariant ? "text-white/70" : "text-gray-600"
                  }`}
                >
                  {product.category}
                </p>
                <p
                  className={
                    isSellerVariant
                      ? "text-xs text-white/85"
                      : "text-xs text-gray-700"
                  }
                >
                  ₹ {product.price.toFixed(2)}
                </p>
                <p
                  className={
                    isSellerVariant
                      ? "text-xs text-white/85"
                      : "text-xs text-gray-700"
                  }
                >
                  Stock: {product.stock ?? 0}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              {canFeature && (
                <button
                  type="button"
                  aria-label={`${product.isFeatured ? "Remove featured status from" : "Feature"} ${product.name}`}
                  onClick={() => dispatch(toggleFeatured(product._id))}
                  className={`p-2 rounded-full transition ${
                    product.isFeatured
                      ? "bg-yellow-400 hover:bg-yellow-500"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                >
                  <Star size={18} className="text-white" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                aria-label={`Delete ${product.name}`}
                onClick={() => dispatch(deleteProductThunk(product._id))}
                className={`p-2 text-white transition ${
                  isSellerVariant
                    ? "border border-rose-300/20 bg-rose-400/10 hover:bg-rose-400/20"
                    : "rounded-full bg-red-500 hover:bg-red-600"
                }`}
              >
                <Trash size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageProducts;
