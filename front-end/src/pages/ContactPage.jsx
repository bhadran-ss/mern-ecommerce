import { ArrowLeft, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const ContactPage = () => (
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
      <header className="mb-8 max-w-3xl border-b border-white/10 pb-8 sm:mb-10 sm:pb-10">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c6b2ff]">
          Vistyle / contact
        </p>
        <h1 className="font-serif text-5xl font-light leading-[1.05] tracking-[-0.05em] text-[#f4f1e9] sm:text-6xl">
          We’re here to help.
        </h1>
        <p className="mb-0 mt-5 text-sm leading-7 text-white/60 sm:text-base">
          Contact options will be available here when a support channel is
          configured.
        </p>
      </header>

      <section className="max-w-2xl border border-white/10 bg-[#181815]/75 p-6 sm:p-9">
        <span className="mb-6 grid h-12 w-12 place-items-center border border-[#c6b2ff]/30 bg-[#c6b2ff]/[0.06] text-[#d9ccff]">
          <MessageCircle size={20} aria-hidden="true" />
        </span>
        <h2 className="mb-3 font-serif text-2xl font-light text-[#f4f1e9]">
          Contact form unavailable
        </h2>
        <p className="mb-0 max-w-xl text-sm leading-7 text-white/55">
          This demo does not currently have a configured message-submission
          service. No message is sent from this page.
        </p>
      </section>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 text-xs font-medium tracking-wide text-white/60 no-underline transition hover:text-[#d9ccff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to Vistyle
      </Link>
    </div>
  </main>
);

export default ContactPage;
