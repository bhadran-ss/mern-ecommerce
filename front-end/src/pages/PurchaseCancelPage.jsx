import { ArrowRight, CircleX } from "lucide-react";
import { Link } from "react-router-dom";
import CheckoutResultLayout from "../components/CheckoutResultLayout";

const PurchaseCancelPage = () => {
  return (
    <CheckoutResultLayout
      eyebrow="Vistyle / checkout paused"
      title="Take your time."
      description="This checkout wasn't completed. Your cart is still available whenever you're ready to try again."
      statusIcon={<CircleX size={23} strokeWidth={1.6} />}
      tone="warning"
    >
      <div className="flex flex-wrap gap-3">
        <Link
          to="/cart"
          className="group inline-flex min-h-12 items-center gap-3 border border-[#c6b2ff] bg-[#c6b2ff] px-5 py-3 text-sm font-semibold text-[#17151b] no-underline transition hover:bg-[#d5c8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
        >
          Return to cart
          <ArrowRight
            size={16}
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
        <Link
          to="/products"
          className="inline-flex min-h-12 items-center border border-white/20 px-5 py-3 text-sm font-medium text-[#f4f1e9] no-underline transition hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
        >
          Continue browsing
        </Link>
      </div>
    </CheckoutResultLayout>
  );
};

export default PurchaseCancelPage;
