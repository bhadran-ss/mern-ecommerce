import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const toneClasses = {
  accent: "border-[#c6b2ff]/30 bg-[#c6b2ff]/10 text-[#d9ccff]",
  success: "border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-200",
  warning: "border-amber-300/25 bg-amber-300/[0.08] text-amber-100",
  error: "border-rose-300/25 bg-rose-300/[0.08] text-rose-200",
};

const CheckoutResultLayout = ({
  eyebrow,
  title,
  description,
  statusIcon,
  tone = "accent",
  children,
}) => (
  <main className="relative isolate flex-1 overflow-hidden bg-[#11110f] text-[#f4f1e9] selection:bg-[#c6b2ff] selection:text-[#17151b]">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -left-52 -top-48 h-[34rem] w-[34rem] rounded-full bg-[#7b61a8]/20 blur-[120px]" />
      <div className="absolute -bottom-56 right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-[#555f44]/15 blur-[120px]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:72px_72px]" />
    </div>

    <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 sm:px-8 lg:px-12">
      <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10">
        <Link
          to="/"
          aria-label="Vistyle home"
          className="group inline-flex items-center gap-3 text-[#f4f1e9] no-underline transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
        >
          <span className="grid h-9 w-9 place-items-center border border-[#c6b2ff]/70 font-serif text-lg text-[#d9ccff] transition group-hover:bg-[#c6b2ff]/10">
            V
          </span>
          <span className="text-xs font-semibold tracking-[0.28em]">
            VISTYLE
          </span>
        </Link>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-white/65 no-underline transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Back to shop
        </Link>
      </header>

      <div className="grid flex-1 items-center gap-8 py-10 md:py-14 xl:grid-cols-[minmax(0,1fr)_minmax(400px,0.85fr)] xl:gap-16 xl:py-16">
        <aside className="relative hidden min-h-[430px] flex-col justify-between overflow-hidden border border-white/10 bg-[#181815]/70 p-10 lg:flex xl:min-h-[540px] xl:p-14">
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 top-10 h-[27rem] w-[27rem] rounded-full border border-[#c6b2ff]/20" />
            <div className="absolute -right-8 top-28 h-[23rem] w-[23rem] rounded-full border border-[#c6b2ff]/15" />
            <div className="absolute right-14 top-48 h-[18rem] w-[18rem] rounded-full bg-gradient-to-br from-[#a993d4]/30 via-[#554667]/20 to-transparent blur-2xl" />
            <div className="absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-t from-[#11110f] to-transparent" />
            <span className="absolute right-[18%] top-[18%] font-serif text-[18rem] font-light leading-none text-white/[0.035]">
              V
            </span>
          </div>
          <div className="relative z-10">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c6b2ff]">
              Vistyle / checkout
            </p>
            <h2 className="max-w-lg font-serif text-5xl font-light leading-[1.08] tracking-[-0.04em] text-[#f4f1e9] xl:text-6xl">
              A considered finish.
            </h2>
          </div>
          <div className="relative z-10 max-w-sm">
            <div className="mb-4 flex items-center gap-2 text-xs font-medium text-white/70">
              <ShieldCheck size={15} className="text-[#d9ccff]" aria-hidden="true" />
              Test mode only
            </div>
            <p className="mb-0 text-sm leading-6 text-white/55">
              Demo payment — no real money will be charged.
            </p>
          </div>
        </aside>

        <section
          aria-labelledby="checkout-result-title"
          className="mx-auto w-full max-w-[560px] border border-white/10 bg-[#181815]/80 p-6 sm:p-10 xl:mx-0 xl:justify-self-center"
        >
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c6b2ff]">
            {eyebrow}
          </p>
          <div
            aria-hidden="true"
            className={`mb-6 grid h-14 w-14 place-items-center border ${toneClasses[tone] || toneClasses.accent}`}
          >
            {statusIcon}
          </div>
          <h1
            id="checkout-result-title"
            className="mb-3 font-serif text-4xl font-light leading-tight tracking-[-0.04em] text-[#f4f1e9] sm:text-5xl"
          >
            {title}
          </h1>
          <p
            className="mb-8 text-sm leading-6 text-white/60"
            role="status"
            aria-live="polite"
          >
            {description}
          </p>
          {children}
          <p className="mb-0 mt-8 border-t border-white/10 pt-5 text-xs leading-5 text-white/40">
            Demo payment — no real money will be charged.
          </p>
        </section>
      </div>

      <footer className="flex min-h-12 items-center justify-between border-t border-white/10 text-[10px] tracking-wide text-white/35">
        <span>VISTYLE</span>
        <span>Demo checkout</span>
      </footer>
    </div>
  </main>
);

export default CheckoutResultLayout;
