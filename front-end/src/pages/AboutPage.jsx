import { ArrowRight, Layers3, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const AboutPage = () => (
  <main className="relative isolate flex-1 overflow-hidden bg-[#11110f] text-[#f4f1e9] selection:bg-[#c6b2ff] selection:text-[#17151b]">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -left-52 -top-48 h-[34rem] w-[34rem] rounded-full bg-[#7b61a8]/20 blur-[120px]" />
      <div className="absolute -bottom-56 right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-[#555f44]/15 blur-[120px]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:72px_72px]" />
    </div>

    <div className="mx-auto w-full max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
      <header className="max-w-4xl border-b border-white/10 pb-8 sm:pb-10">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c6b2ff]">
          Vistyle / about
        </p>
        <h1 className="font-serif text-5xl font-light leading-[1.05] tracking-[-0.05em] text-[#f4f1e9] sm:text-6xl lg:text-7xl">
          A space for your point of view.
        </h1>
        <p className="mb-0 mt-6 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
          Vistyle is a fashion storefront for exploring clothing, accessories,
          and the details that make a look your own.
        </p>
      </header>

      <section
        aria-label="About Vistyle"
        className="grid gap-4 py-8 sm:grid-cols-2 sm:py-10"
      >
        <article className="border border-white/10 bg-[#181815]/70 p-6 sm:p-8">
          <Layers3
            size={20}
            className="mb-6 text-[#c6b2ff]"
            aria-hidden="true"
          />
          <h2 className="mb-3 font-serif text-2xl font-light text-[#f4f1e9]">
            Explore the collection
          </h2>
          <p className="mb-0 text-sm leading-7 text-white/55">
            Browse the available catalog by category, view product details, and
            keep the pieces you like in your cart.
          </p>
        </article>
        <article className="border border-white/10 bg-[#181815]/70 p-6 sm:p-8">
          <ShoppingBag
            size={20}
            className="mb-6 text-[#c6b2ff]"
            aria-hidden="true"
          />
          <h2 className="mb-3 font-serif text-2xl font-light text-[#f4f1e9]">
            Built around the shop
          </h2>
          <p className="mb-0 text-sm leading-7 text-white/55">
            Vistyle includes customer accounts, seller product listings, and
            catalog management for administrators.
          </p>
        </article>
      </section>

      <Link
        to="/products"
        className="group inline-flex min-h-12 items-center gap-3 border border-[#c6b2ff] bg-[#c6b2ff] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#17151b] no-underline transition hover:bg-[#d5c8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
      >
        Explore the shop
        <ArrowRight
          size={15}
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-1"
        />
      </Link>
    </div>
  </main>
);

export default AboutPage;
