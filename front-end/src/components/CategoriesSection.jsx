import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const CategoriesSection = ({ categories }) => {
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
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/category/${encodeURIComponent(cat.name.toLowerCase())}`}
              className="group border border-white/10 bg-[#181815]/75 p-2 text-[#f4f1e9] no-underline transition hover:border-[#c6b2ff]/35 hover:bg-[#1d1c19] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c6b2ff] sm:p-3"
            >
              <div className="aspect-[4/3] overflow-hidden bg-white/[0.035]">
              <img
                src={cat.image}
                alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
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
      </div>
    </section>
  );
};

export default CategoriesSection;
