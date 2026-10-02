import { useSelector } from "react-redux";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "./Card";

const TopPicks = () => {
  const featuredProducts = useSelector(
    (state) => state.products.featuredProducts,
  );
  return (
    <section className="mx-auto w-full max-w-[1440px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c6b2ff]">
            Vistyle / selected
          </p>
          <h2 className="font-serif text-3xl font-light tracking-[-0.04em] text-[#f4f1e9] sm:text-4xl">
            Featured pieces.
          </h2>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-white/65 no-underline transition hover:text-[#d9ccff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
        >
          Browse collection <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </header>

      {featuredProducts?.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <div key={product._id} className="w-full min-w-0">
              <Card product={product} variant="vistyle" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-52 flex-col items-center justify-center border border-white/10 bg-[#181815]/65 px-6 py-10 text-center">
          <Sparkles size={20} className="mb-4 text-[#c6b2ff]" aria-hidden="true" />
          <h3 className="mb-2 font-serif text-xl font-light text-[#f4f1e9]">
            Featured pieces will appear here.
          </h3>
          <p className="mb-0 max-w-md text-sm leading-6 text-white/55">
            Explore the full collection to find something that speaks to you.
          </p>
        </div>
      )}
    </section>
  );
};

export default TopPicks;
