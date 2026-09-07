import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const CategoriesSection = ({ categories, status, error, onRetry }) => {
  return (
    <section
      id="collections"
      className="border-t border-white/10 bg-[#151513]"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <header className="mb-8 sm:mb-10">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c6b2ff]">
            Vistyle / browse
          </p>
          <h2 className="font-serif text-3xl font-light tracking-[-0.04em] text-[#f4f1e9] sm:text-4xl">
            Shop by category.
          </h2>
        </header>
        {status === "loading" && categories.length === 0 ? (
          <p role="status" className="border border-white/10 p-6 text-sm text-white/60">
            Loading categories...
          </p>
        ) : status === "failed" ? (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-4 border border-rose-300/25 bg-rose-300/[0.06] p-5"
          >
            <p className="mb-0 text-sm text-rose-100">
              {error || "Categories could not be loaded."}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="min-h-10 border border-[#c6b2ff]/60 px-4 text-sm text-[#e3d8ff]"
            >
              Try again
            </button>
          </div>
        ) : categories.length === 0 ? (
          <p className="border border-white/10 p-6 text-sm text-white/60">
            No categories are available yet.
          </p>
        ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/category/${encodeURIComponent(cat.slug)}`}
                    className="group border border-white/10 bg-[#181815]/75 p-2 text-[#f4f1e9] no-underline transition hover:border-[#c6b2ff]/35 hover:bg-[#1d1c19] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c6b2ff] sm:p-3"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-white/[0.035]">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt=""
                          aria-hidden="true"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="grid h-full place-items-center bg-gradient-to-br from-[#28252b] via-[#19181a] to-[#11110f] font-serif text-5xl font-light text-white/10"
                        >
                          {cat.name.slice(0, 1).toUpperCase()}
                        </div>
                  )}
                    </div>
                    <span className="flex items-center justify-between px-2 py-3 text-sm font-medium tracking-wide sm:px-3 sm:py-4">
                      {cat.name}
                      <ArrowUpRight
                        size={16}
                        aria-hidden="true"
                        className="text-[#c6b2ff] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                ))}
              </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;
