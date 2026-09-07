import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  createCategory,
  deactivateCategory,
  fetchAdminCategories,
} from "../store/slices/categorySlice";

const emptyForm = { name: "", description: "", image: "" };
const inputClassName =
  "w-full border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-[#f4f1e9] placeholder:text-white/30 focus:border-[#c6b2ff]/80 focus:outline-none focus:ring-2 focus:ring-[#c6b2ff]/20";
const labelClassName =
  "mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65";

const CategoryManagement = () => {
  const dispatch = useDispatch();
  const {
    adminCategories,
    adminCategoriesStatus,
    adminCategoriesError,
  } = useSelector((state) => state.categories);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [savingError, setSavingError] = useState("");
  const [busyCategoryId, setBusyCategoryId] = useState(null);

  useEffect(() => {
    if (adminCategoriesStatus === "idle") dispatch(fetchAdminCategories());
  }, [adminCategoriesStatus, dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setSavingError("");
    const result = await dispatch(createCategory(form));
    if (createCategory.fulfilled.match(result)) {
      setForm(emptyForm);
    } else {
      setSavingError(result.payload || "Category could not be saved.");
    }
    setIsSaving(false);
  };

  const handleDeactivate = async (category) => {
    setBusyCategoryId(category._id);
    const result = await dispatch(deactivateCategory(category._id));
    if (!deactivateCategory.fulfilled.match(result)) {
      setSavingError(result.payload || "Category could not be deactivated.");
    } else {
      setSavingError("");
    }
    setBusyCategoryId(null);
  };

  return (
    <section aria-label="Category management" className="space-y-8">
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c6b2ff]">
          Store taxonomy
        </p>
        <h2 className="mb-2 font-serif text-2xl font-light text-[#f4f1e9]">
          Manage categories
        </h2>
        <p className="mb-0 max-w-2xl text-sm leading-6 text-white/55">
          Categories are shared by the storefront and product forms. Existing
          product categories remain available automatically. Categories with
          products cannot be deactivated until those products are moved.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 border border-white/10 bg-[#11110f]/70 p-5 sm:p-6"
        aria-busy={isSaving}
      >
        <h3 className="mb-0 font-serif text-xl font-light text-[#f4f1e9]">
          Create a category
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClassName} htmlFor="category-name">
              Category name
            </label>
            <input
              id="category-name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className={inputClassName}
              minLength={2}
              maxLength={60}
              placeholder="e.g. Knitwear"
              required
            />
          </div>
          <div>
            <label className={labelClassName} htmlFor="category-image">
              Image URL <span className="normal-case tracking-normal text-white/35">(optional)</span>
            </label>
            <input
              id="category-image"
              type="url"
              value={form.image}
              onChange={(event) =>
                setForm((current) => ({ ...current, image: event.target.value }))
              }
              className={inputClassName}
              maxLength={500}
              placeholder="https://..."
            />
          </div>
        </div>
        <div>
          <label className={labelClassName} htmlFor="category-description">
            Description <span className="normal-case tracking-normal text-white/35">(optional)</span>
          </label>
          <textarea
            id="category-description"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            className={`${inputClassName} min-h-24 resize-y`}
            maxLength={300}
            placeholder="A short introduction to this collection."
          />
        </div>
        {savingError && (
          <p role="alert" className="mb-0 text-sm text-rose-200">
            {savingError}
          </p>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="min-h-11 border border-[#c6b2ff] bg-[#c6b2ff] px-5 text-sm font-semibold text-[#17151b] transition hover:bg-[#d5c8ff] disabled:cursor-wait disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Create category"}
        </button>
      </form>

      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="mb-0 font-serif text-xl font-light text-[#f4f1e9]">
              Store categories
            </h3>
            <p className="mb-0 mt-1 text-xs text-white/45">
              Legacy categories are inferred from existing products until adopted.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(fetchAdminCategories())}
            disabled={adminCategoriesStatus === "loading"}
            className="inline-flex min-h-10 items-center gap-2 border border-white/15 px-3 text-sm text-white/70 hover:border-[#c6b2ff]/50 disabled:opacity-60"
          >
            <RotateCw
              size={14}
              aria-hidden="true"
              className={adminCategoriesStatus === "loading" ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {adminCategoriesError && (
          <div role="alert" className="border border-rose-300/25 p-4 text-sm text-rose-100">
            {adminCategoriesError}
            <button
              type="button"
              onClick={() => dispatch(fetchAdminCategories())}
              className="ml-3 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {adminCategoriesStatus === "loading" && adminCategories.length === 0 ? (
          <p role="status" className="border border-white/10 p-6 text-sm text-white/60">
            Loading categories...
          </p>
        ) : adminCategories.length === 0 ? (
          <p className="border border-white/10 p-6 text-sm text-white/60">
            No categories yet. Create the first one above.
          </p>
        ) : (
          <ul className="divide-y divide-white/10 border border-white/10">
            {adminCategories.map((category) => (
              <li
                key={category._id || category.slug}
                className="flex flex-wrap items-center justify-between gap-4 bg-[#11110f]/70 p-4 sm:px-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="mb-0 font-medium text-[#f4f1e9]">
                      {category.name}
                    </h4>
                    <span
                      className={`border px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${
                        category.isActive
                          ? "border-emerald-200/20 text-emerald-100"
                          : "border-white/15 text-white/45"
                      }`}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                    {category.isLegacy && (
                      <span className="border border-white/15 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white/45">
                        Existing product category
                      </span>
                    )}
                  </div>
                  {category.description && (
                    <p className="mb-0 mt-1 text-sm text-white/50">
                      {category.description}
                    </p>
                  )}
                  <p className="mb-0 mt-1 text-xs text-white/35">
                    /category/{category.slug}
                  </p>
                </div>
                {category.isLegacy ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSavingError("");
                      dispatch(
                        createCategory({
                          name: category.name,
                          description: "",
                          image: "",
                        }),
                      ).unwrap().catch((error) => setSavingError(error));
                    }}
                    className="min-h-10 border border-white/15 px-3 text-sm text-white/70 transition hover:border-[#c6b2ff]/50 hover:text-white"
                  >
                    Adopt category
                  </button>
                ) : category.isActive ? (
                  <button
                    type="button"
                    onClick={() => handleDeactivate(category)}
                    disabled={busyCategoryId === category._id}
                    className="min-h-10 border border-rose-200/25 px-3 text-sm text-rose-100 transition hover:bg-rose-200/[0.08] disabled:cursor-wait disabled:opacity-60"
                  >
                    {busyCategoryId === category._id
                      ? "Deactivating..."
                      : "Deactivate"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        name: category.name,
                        description: category.description || "",
                        image: category.image || "",
                      });
                    }}
                    className="min-h-10 border border-white/15 px-3 text-sm text-white/70 transition hover:border-[#c6b2ff]/50 hover:text-white"
                  >
                    Edit to reactivate
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default CategoryManagement;
