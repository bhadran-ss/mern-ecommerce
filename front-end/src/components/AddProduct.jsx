import React, { useEffect, useState } from "react";
import { RotateCw, Upload } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createProduct as createProductThunk } from "../store/slices/productSlice";
import { fetchCategories } from "../store/slices/categorySlice";

const AddProduct = ({ variant = "default", onCreated }) => {
  const isSellerVariant = variant === "seller";
  const isThemedVariant = isSellerVariant || variant === "admin";
  const dispatch = useDispatch();
  const {
    categories,
    categoriesStatus,
    categoriesError,
  } = useSelector((state) => state.categories);
  const [newproduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "",
    price: 0,
    stock: 0,
    image: null,
  });
  const loading = useSelector((state) => state.products.loading);

  useEffect(() => {
    if (categoriesStatus === "idle") dispatch(fetchCategories());
  }, [categoriesStatus, dispatch]);

  useEffect(() => {
    if (!newproduct.category && categories.length > 0) {
      setNewProduct((current) => ({ ...current, category: categories[0].name }));
    }
  }, [categories, newproduct.category]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct((current) => ({ ...current, image: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setNewProduct((current) => ({ ...current, image: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createProductThunk(newproduct))
      .then((result) => {
        if (!createProductThunk.fulfilled.match(result)) return;

        setNewProduct({
          name: "",
          description: "",
          category: categories[0]?.name || "",
          price: 0,
          stock: 0,
          image: null,
        });
        onCreated?.();
      });
  };
  if (loading && !isThemedVariant) {
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
    <div
      className={
        isThemedVariant
          ? "mx-auto max-w-3xl"
          : "mx-auto mt-10 max-w-2xl rounded-lg bg-white p-6 shadow"
      }
    >
      <h2
        className={
          isThemedVariant
            ? "mb-6 font-serif text-2xl font-light text-[#f4f1e9]"
            : "mb-6 text-center text-3xl font-semibold"
        }
      >
        {isThemedVariant ? "Add a product" : "Add New Product"}
      </h2>
      <form
        onSubmit={handleSubmit}
        className={`space-y-5 ${isThemedVariant ? "text-[#f4f1e9]" : ""}`}
        aria-busy={loading}
      >
        <div>
          <label
            htmlFor="new-product-name"
            className={`mb-1 block font-medium ${
              isThemedVariant
                ? "text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80"
                : ""
            }`}
          >
            Product name
          </label>
          <input
            id="new-product-name"
            type="text"
            className={`w-full border px-3 py-2 focus:outline-none focus:ring-2 ${
              isThemedVariant
                ? "border-white/15 bg-white/[0.045] py-3 text-sm text-[#f4f1e9] placeholder:text-white/30 focus:border-[#c6b2ff]/80 focus:ring-[#c6b2ff]/20"
                : "rounded border-gray-300 focus:ring-purple-500"
            }`}
            value={newproduct.name}
            onChange={(e) =>
              setNewProduct({ ...newproduct, name: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label
            htmlFor="new-product-description"
            className={`mb-1 block font-medium ${
              isThemedVariant
                ? "text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80"
                : ""
            }`}
          >
            Description
          </label>
          <textarea
            id="new-product-description"
            rows="4"
            className={`w-full border px-3 py-2 focus:outline-none focus:ring-2 ${
              isThemedVariant
                ? "border-white/15 bg-white/[0.045] text-sm text-[#f4f1e9] placeholder:text-white/30 focus:border-[#c6b2ff]/80 focus:ring-[#c6b2ff]/20"
                : "rounded border-gray-300 focus:ring-purple-500"
            }`}
            value={newproduct.description}
            onChange={(e) =>
              setNewProduct({ ...newproduct, description: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label
            htmlFor="new-product-category"
            className={`mb-1 block font-medium ${
              isThemedVariant
                ? "text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80"
                : ""
            }`}
          >
            Category
          </label>
          <select
            id="new-product-category"
            className={`w-full border px-3 py-2 focus:outline-none focus:ring-2 ${
              isThemedVariant
                ? "border-white/15 bg-[#1a191b] text-sm text-[#f4f1e9] focus:border-[#c6b2ff]/80 focus:ring-[#c6b2ff]/20"
                : "rounded border-gray-300 focus:ring-purple-500"
            }`}
            value={newproduct.category}
            onChange={(e) =>
              setNewProduct({ ...newproduct, category: e.target.value })
            }
          >
            {categories.map((category) => (
              <option key={category.slug} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          {categoriesStatus === "failed" ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-rose-200">
              <span>{categoriesError}</span>
              <button
                type="button"
                onClick={() => dispatch(fetchCategories())}
                className="inline-flex min-h-8 items-center gap-1 underline underline-offset-2"
              >
                <RotateCw size={13} aria-hidden="true" />
                Retry
              </button>
            </div>
          ) : categories.length === 0 && categoriesStatus !== "loading" ? (
            <p className="mb-0 mt-2 text-xs text-white/55">
              No active categories yet. Ask an administrator to add one.
            </p>
          ) : categoriesStatus === "loading" ? (
            <p role="status" className="mb-0 mt-2 text-xs text-white/55">
              Loading categories...
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="new-product-price"
            className={`mb-1 block font-medium ${
              isThemedVariant
                ? "text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80"
                : ""
            }`}
          >
            Price (₹)
          </label>
          <input
            id="new-product-price"
            type="number"
            min={isThemedVariant ? "0" : undefined}
            step={isThemedVariant ? "0.01" : undefined}
            className={`w-full border px-3 py-2 focus:outline-none focus:ring-2 ${
              isThemedVariant
                ? "border-white/15 bg-white/[0.045] text-sm text-[#f4f1e9] focus:border-[#c6b2ff]/80 focus:ring-[#c6b2ff]/20"
                : "rounded border-gray-300 focus:ring-purple-500"
            }`}
            value={newproduct.price}
            onChange={(e) =>
              setNewProduct({
                ...newproduct,
                price: parseFloat(e.target.value),
              })
            }
            required
          />
        </div>

        <div>
          <label
            htmlFor="new-product-stock"
            className={`mb-1 block font-medium ${
              isThemedVariant
                ? "text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80"
                : ""
            }`}
          >
            Stock
          </label>
          <input
            id="new-product-stock"
            type="number"
            min="0"
            className={`w-full border px-3 py-2 focus:outline-none focus:ring-2 ${
              isThemedVariant
                ? "border-white/15 bg-white/[0.045] text-sm text-[#f4f1e9] focus:border-[#c6b2ff]/80 focus:ring-[#c6b2ff]/20"
                : "rounded border-gray-300 focus:ring-purple-500"
            }`}
            value={newproduct.stock}
            onChange={(e) =>
              setNewProduct({
                ...newproduct,
                stock: parseInt(e.target.value, 10) || 0,
              })
            }
            required
          />
        </div>

        <div>
          <label
            htmlFor="new-product-image"
            className={`mb-1 block font-medium ${
              isThemedVariant
                ? "text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80"
                : ""
            }`}
          >
            Image
          </label>
          <div className="flex items-center gap-3">
            <label
              htmlFor="new-product-image"
              className={`flex cursor-pointer items-center gap-2 text-sm font-medium ${
                isThemedVariant
                  ? "text-[#e3d8ff]"
                  : "text-purple-600"
              }`}
            >
              <Upload size={20} /> Upload Image
              <input
                id="new-product-image"
                type="file"
                className={isThemedVariant ? "sr-only" : "hidden"}
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />
            </label>
            {newproduct.image && (
              <img
                src={newproduct.image}
                alt="preview"
                className="w-16 h-16 object-cover rounded border"
              />
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || categoriesStatus !== "succeeded" || categories.length === 0}
          className={`w-full px-4 py-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
            isThemedVariant
              ? "border border-[#c6b2ff] bg-[#c6b2ff] text-[#17151b] hover:bg-[#d5c8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
              : "rounded bg-black text-white hover:bg-gray-800"
          }`}
        >
          {loading
            ? "Publishing listing..."
            : isThemedVariant
              ? "Publish listing"
              : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
