import { Link } from "react-router-dom";

const AuthLayout = ({ eyebrow, title, description, footer, children }) => (
  <main className="relative isolate min-h-screen overflow-hidden bg-[#11110f] text-[#f4f1e9] selection:bg-[#c6b2ff] selection:text-[#17151b]">
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
          className="group inline-flex items-center gap-3 text-[#f4f1e9] no-underline hover:text-[#f4f1e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
        >
          <span className="grid h-9 w-9 place-items-center border border-[#c6b2ff]/70 font-serif text-lg text-[#d9ccff] transition group-hover:bg-[#c6b2ff]/10">
            V
          </span>
          <span className="text-xs font-semibold tracking-[0.28em]">VISTYLE</span>
        </Link>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-white/65 no-underline transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
        >
          Back to shop <span aria-hidden="true">&#8599;</span>
        </Link>
      </header>

      <div className="grid flex-1 items-center gap-10 py-10 md:py-14 xl:grid-cols-[1.05fr_0.95fr] xl:gap-16 xl:py-16">
        <aside className="relative hidden min-h-[590px] flex-col justify-between overflow-hidden border border-white/10 bg-[#181815]/70 p-10 xl:flex xl:p-14">
          <div
            aria-hidden="true"
            className="absolute inset-0 overflow-hidden"
          >
            <div className="absolute -right-24 top-16 h-[26rem] w-[26rem] rounded-full border border-[#c6b2ff]/20" />
            <div className="absolute -right-10 top-32 h-[23rem] w-[23rem] rounded-full border border-[#c6b2ff]/15" />
            <div className="absolute right-16 top-52 h-[18rem] w-[18rem] rounded-full bg-gradient-to-br from-[#a993d4]/35 via-[#554667]/20 to-transparent blur-2xl" />
            <div className="absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-t from-[#11110f] to-transparent" />
            <span className="absolute right-[18%] top-[22%] font-serif text-[18rem] font-light leading-none text-white/[0.035]">
              V
            </span>
          </div>

          <div className="relative z-10">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c6b2ff]">
              Vistyle / your account
            </p>
            <p className="max-w-md font-serif text-5xl font-light leading-[1.08] tracking-[-0.04em] text-[#f4f1e9] xl:text-6xl">
              Style is a point of view.
            </p>
          </div>

          <div className="relative z-10 flex items-end justify-between gap-6">
            <p className="mb-0 max-w-xs text-sm leading-6 text-white/55">
              A considered space for the pieces, details, and looks that feel like you.
            </p>
            <span className="mb-1 h-px w-16 shrink-0 bg-[#c6b2ff]/70" />
          </div>
        </aside>

        <section className="mx-auto w-full max-w-[470px] py-3 xl:mx-0 xl:justify-self-center">
          <div className="mb-8 xl:hidden">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c6b2ff]">
              Vistyle / your account
            </p>
            <p className="font-serif text-3xl font-light tracking-[-0.03em] text-[#f4f1e9]">
              Style is a point of view.
            </p>
          </div>

          <div className="mb-8">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c6b2ff]">
              {eyebrow}
            </p>
            <h1 className="mb-3 font-serif text-4xl font-light leading-tight tracking-[-0.04em] text-[#f4f1e9] sm:text-5xl">
              {title}
            </h1>
            <p className="mb-0 text-sm leading-6 text-white/55">{description}</p>
          </div>

          {children}

          <div className="mt-7 border-t border-white/10 pt-6 text-sm text-white/55">
            {footer}
          </div>
        </section>
      </div>

      <footer className="flex min-h-12 items-center justify-between border-t border-white/10 text-[10px] tracking-wide text-white/35">
        <span>VISTYLE</span>
        <span>Personal style, your way.</span>
      </footer>
    </div>
  </main>
);

export default AuthLayout;
