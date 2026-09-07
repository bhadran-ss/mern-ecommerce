import React, { useEffect } from "react";
import { ArrowDown, ArrowRight, CreditCard, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import bg from "/bg.jpg";
import jeans from "/category-images/jeans.jpg";
import shirts from "/category-images/shirts.jpg";
import suits from "/category-images/suits.jpg";
import bags from "/category-images/bags.jpg";
import jackets from "/category-images/jackets.jpg";
import shoes from "/category-images/shoes.jpg";
import accessories from "/category-images/accessories.jpg";
import electronics from "/category-images/electronics.jpg";
import pants from "/category-images/pants.jpg";
import hoodies from "/category-images/hoodies.jpg";
import tops from "/category-images/tops.jpg";
import TopPicks from "../components/TopPicks";
import CategoriesSection from "../components/CategoriesSection";
import { fetchCategories } from "../store/slices/categorySlice";

const categoryImageBySlug = {
  jeans,
  shirts,
  suits,
  bags,
  jackets,
  shoes,
  accessories,
  electronics,
  pants,
  hoodies,
  tops,
};

const HomePage = () => {
  const dispatch = useDispatch();
  const { categories, categoriesStatus, categoriesError } = useSelector(
    (state) => state.categories,
  );

  useEffect(() => {
    if (categoriesStatus === "idle") dispatch(fetchCategories());
  }, [categoriesStatus, dispatch]);

  const categoriesWithArtwork = categories.map((category) => ({
    ...category,
    image: category.image || categoryImageBySlug[category.slug] || "",
  }));

  return (
    <main className="relative isolate flex-1 overflow-hidden bg-[#11110f] text-[#f4f1e9]">
    <section
      aria-labelledby="home-title"
      className="relative isolate flex min-h-[620px] items-end overflow-hidden border-b border-white/10 sm:min-h-[700px] lg:min-h-[calc(100svh-76px)]"
    >
      <img
        src={bg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[#11110f]/95 via-[#11110f]/65 to-[#11110f]/20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-[#11110f]/75 via-transparent to-[#11110f]/25"
      />

      <div className="mx-auto w-full max-w-[1440px] px-5 pb-20 pt-28 sm:px-8 sm:pb-24 lg:px-12 lg:pb-32">
        <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.34em] text-[#d9ccff]">
          Vistyle / the collection
        </p>
        <h1
          id="home-title"
          className="max-w-4xl font-serif text-6xl font-light leading-[0.98] tracking-[-0.055em] text-[#f4f1e9] sm:text-7xl lg:text-8xl"
        >
          Style is a
          <br />
          point of view.
        </h1>
        <p className="mb-8 mt-6 max-w-lg text-sm leading-7 text-white/65 sm:text-base">
          Explore considered pieces across clothing, accessories, and everyday
          essentials.
        </p>
        <Link
          to="/products"
          className="group inline-flex min-h-12 items-center gap-4 border border-[#c6b2ff] bg-[#c6b2ff] px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#17151b] no-underline transition hover:bg-[#d5c8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
        >
          Explore collection
          <ArrowRight
            size={16}
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
        <a
          href="#collections"
          className="ml-5 inline-flex min-h-12 items-center gap-2 text-xs font-medium tracking-wide text-white/70 no-underline transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
        >
          Discover categories <ArrowDown size={14} aria-hidden="true" />
        </a>
      </div>

      <span className="absolute bottom-8 right-8 hidden font-serif text-xs tracking-[0.18em] text-white/45 lg:block">
        PERSONAL STYLE, YOUR WAY
      </span>
    </section>

    <section
      aria-label="Store information"
      className="mx-auto grid w-full max-w-[1440px] gap-px border-b border-white/10 bg-[#11110f] px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 lg:px-12"
    >
      <article className="flex gap-4 bg-[#11110f] py-7 sm:px-5">
        <Sparkles
          size={19}
          className="mt-1 shrink-0 text-[#c6b2ff]"
          aria-hidden="true"
        />
        <div>
          <h2 className="mb-1 font-serif text-xl font-light text-[#f4f1e9]">
            Find your style
          </h2>
          <p className="mb-0 text-sm leading-6 text-white/55">
            Browse pieces by category and discover the collection at your own
            pace.
          </p>
        </div>
      </article>
      <article className="flex gap-4 bg-[#11110f] py-7 sm:px-5">
        <CreditCard
          size={19}
          className="mt-1 shrink-0 text-[#c6b2ff]"
          aria-hidden="true"
        />
        <div>
          <h2 className="mb-1 font-serif text-xl font-light text-[#f4f1e9]">
            Demo checkout
          </h2>
          <p className="mb-0 text-sm leading-6 text-white/55">
            Try the Stripe test-mode checkout. Demo payment — no real money will
            be charged.
          </p>
        </div>
      </article>
      <article className="flex gap-4 bg-[#11110f] py-7 sm:col-span-2 sm:px-5 lg:col-span-1">
        <ArrowRight
          size={19}
          className="mt-1 shrink-0 text-[#c6b2ff]"
          aria-hidden="true"
        />
        <div>
          <h2 className="mb-1 font-serif text-xl font-light text-[#f4f1e9]">
            Shop by category
          </h2>
          <p className="mb-0 text-sm leading-6 text-white/55">
            Move straight to clothing, bags, shoes, and more.
          </p>
        </div>
      </article>
    </section>

    <TopPicks />
    <CategoriesSection
      categories={categoriesWithArtwork}
      status={categoriesStatus}
      error={categoriesError}
      onRetry={() => dispatch(fetchCategories())}
    />
  </main>
  );
};

export default HomePage;
