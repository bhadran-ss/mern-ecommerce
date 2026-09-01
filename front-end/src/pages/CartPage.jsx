import React, { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getCart as getAuthoritativeCart,
  removeFromCart,
  updateQuantity,
} from "../store/slices/cartSlice";
import axios from "../lib/axios";

const CartPage = () => {
  const dispatch = useDispatch();
  const { cart, total, unavailableItems } = useSelector((state) => state.cart);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const checkoutInProgress = useRef(false);
  const checkoutRequest = useRef(null);

  const handlePayment = async () => {
    if (checkoutInProgress.current) return;

    if (typeof globalThis.crypto?.randomUUID !== "function") {
      toast.error("Secure checkout requests are unavailable in this browser.");
      return;
    }

    checkoutInProgress.current = true;
    setIsCheckingOut(true);

    const cartFingerprint = JSON.stringify(
      cart
        .map((item) => [item._id, item.quantity, item.price])
        .sort(([leftId], [rightId]) => leftId.localeCompare(rightId)),
    );
    if (checkoutRequest.current?.cartFingerprint !== cartFingerprint) {
      checkoutRequest.current = {
        cartFingerprint,
        idempotencyKey: globalThis.crypto.randomUUID(),
      };
    }

    try {
      const response = await axios.post("/payment/checkout", null, {
        headers: {
          "Idempotency-Key": checkoutRequest.current.idempotencyKey,
        },
      });
      const checkoutUrl = new URL(response.data.url);
      if (
        checkoutUrl.protocol !== "https:" ||
        checkoutUrl.hostname !== "checkout.stripe.com"
      ) {
        throw new Error("Stripe returned an invalid checkout link.");
      }
      window.location.assign(checkoutUrl.toString());
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        "Unable to start demo checkout.";
      toast.error(message);
      if (error.response?.status === 409) {
        dispatch(getAuthoritativeCart());
      }
    } finally {
      checkoutInProgress.current = false;
      setIsCheckingOut(false);
    }
  };
  return (
    <main className="relative isolate flex-1 overflow-hidden bg-[#11110f] text-[#f4f1e9] selection:bg-[#c6b2ff] selection:text-[#17151b]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-52 -top-48 h-[34rem] w-[34rem] rounded-full bg-[#7b61a8]/20 blur-[120px]" />
        <div className="absolute -bottom-56 right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-[#555f44]/15 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <div className="mx-auto flex min-h-full w-full max-w-[1440px] flex-col px-5 sm:px-8 lg:px-12">
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

        <div className="relative flex-1 py-10 md:py-14 xl:py-16">
          <div className="mb-8 max-w-3xl md:mb-10">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c6b2ff]">
              Vistyle / your selection
            </p>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="mb-3 font-serif text-4xl font-light leading-tight tracking-[-0.04em] text-[#f4f1e9] sm:text-5xl">
                  Your cart.
                </h1>
                <p className="mb-0 text-sm leading-6 text-white/55">
                  Review your pieces before continuing to demo checkout.
                </p>
              </div>
              <span className="mb-1 border border-white/15 px-3 py-2 text-xs tracking-wide text-white/65">
                {cart.length} {cart.length === 1 ? "item" : "items"}
              </span>
            </div>
          </div>

          {unavailableItems.length > 0 && (
            <p
              role="status"
              className="mb-6 border border-amber-300/25 bg-amber-300/[0.08] p-4 text-sm leading-6 text-amber-100"
            >
              Some products were removed or their quantities were adjusted
              because their availability changed. Review your cart before
              checkout.
            </p>
          )}

          {cart.length === 0 ? (
            <section className="mx-auto flex min-h-[360px] max-w-3xl flex-col items-center justify-center border border-white/10 bg-[#181815]/70 px-6 py-12 text-center sm:px-10">
              <span className="mb-5 grid h-14 w-14 place-items-center border border-[#c6b2ff]/35 text-[#d9ccff]">
                <ShoppingBag size={22} aria-hidden="true" />
              </span>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c6b2ff]">
                Nothing here yet
              </p>
              <h2 className="mb-3 font-serif text-3xl font-light tracking-[-0.03em] text-[#f4f1e9]">
                Your cart is empty.
              </h2>
              <p className="mb-7 max-w-sm text-sm leading-6 text-white/55">
                Explore the collection and add something that feels like you.
              </p>
              <Link
                to="/products"
                className="group inline-flex items-center gap-3 border border-[#c6b2ff] bg-[#c6b2ff] px-5 py-3.5 text-sm font-semibold text-[#17151b] no-underline transition hover:bg-[#d5c8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
              >
                Explore the shop
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </section>
          ) : (
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)] xl:gap-8">
              <section
                aria-label="Cart items"
                className="divide-y divide-white/10 border border-white/10 bg-[#181815]/65 px-5 sm:px-7"
              >
                {cart.map((item) => {
                  const availableStock = Number(item.stock ?? 0);
                  const isOutOfStock = availableStock <= 0;

                  return (
                    <article
                      key={item._id}
                      className="grid gap-5 py-6 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-6 lg:grid-cols-[112px_minmax(0,1fr)_auto] lg:items-center"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-28 w-28 border border-white/10 object-cover"
                        />
                      ) : (
                        <div
                          role="img"
                          aria-label={`${item.name} image unavailable`}
                          className="grid h-28 w-28 place-items-center border border-white/10 bg-white/[0.03] text-white/35"
                        >
                          <ShoppingBag size={22} aria-hidden="true" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c6b2ff]">
                          {isOutOfStock ? "Unavailable" : "In your selection"}
                        </p>
                        <h2 className="mb-1 break-words font-serif text-xl font-light tracking-[-0.02em] text-[#f4f1e9]">
                          {item.name}
                        </h2>
                        <p className="mb-3 text-sm text-white/55">
                          Rs. {Number(item.price).toFixed(2)} each
                          <span className="mx-2 text-white/25" aria-hidden="true">
                            /
                          </span>
                          {isOutOfStock
                            ? "Out of stock"
                            : `${availableStock} available`}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                          <div className="inline-flex items-center border border-white/15">
                            <button
                              type="button"
                              aria-label={`Decrease quantity of ${item.name}`}
                              className="grid h-9 w-9 place-items-center text-white/75 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c6b2ff]"
                              disabled={isCheckingOut || item.quantity <= 1}
                              onClick={() =>
                                dispatch(
                                  updateQuantity({
                                    productId: item._id,
                                    quantity: item.quantity - 1,
                                  }),
                                )
                              }
                            >
                              <Minus size={14} aria-hidden="true" />
                            </button>
                            <span
                              aria-label={`Quantity: ${item.quantity}`}
                              className="min-w-9 text-center text-sm tabular-nums text-[#f4f1e9]"
                            >
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label={`Increase quantity of ${item.name}`}
                              className="grid h-9 w-9 place-items-center text-white/75 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c6b2ff]"
                              disabled={
                                isCheckingOut ||
                                item.quantity >= availableStock ||
                                isOutOfStock
                              }
                              onClick={() => {
                                if (item.quantity >= availableStock) {
                                  toast.error(
                                    `Only ${availableStock} item(s) left in stock.`,
                                  );
                                  return;
                                }

                                dispatch(
                                  updateQuantity({
                                    productId: item._id,
                                    quantity: item.quantity + 1,
                                  }),
                                );
                              }}
                            >
                              <Plus size={14} aria-hidden="true" />
                            </button>
                          </div>
                          <button
                            type="button"
                            disabled={isCheckingOut}
                            className="inline-flex items-center gap-2 text-xs text-white/50 transition hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
                            onClick={() => dispatch(removeFromCart(item._id))}
                          >
                            <Trash2 size={14} aria-hidden="true" /> Remove
                          </button>
                        </div>
                      </div>

                      <p className="mb-0 text-sm font-medium tabular-nums text-[#f4f1e9] sm:col-start-2 lg:col-start-auto lg:text-right">
                        Rs. {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </article>
                  );
                })}
              </section>

              <aside className="border border-white/10 bg-[#181815]/80 p-6 sm:p-8 xl:sticky xl:top-8">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c6b2ff]">
                  Order summary
                </p>
                <h2 className="mb-7 font-serif text-2xl font-light tracking-[-0.03em] text-[#f4f1e9]">
                  A final look.
                </h2>

                <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-5 text-sm">
                  <span className="text-white/55">Cart subtotal</span>
                  <span className="font-medium tabular-nums text-[#f4f1e9]">
                    Rs. {total.toFixed(2)}
                  </span>
                </div>
                <p className="mb-6 text-xs leading-5 text-white/45">
                  Shipping and taxes are not included in this demo checkout.
                </p>

                <div className="mb-6 border border-[#c6b2ff]/20 bg-[#c6b2ff]/[0.07] p-4">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d9ccff]">
                    Test mode only
                  </p>
                  <p className="mb-0 text-sm leading-5 text-white/75">
                    Demo payment &mdash; no real money will be charged.
                  </p>
                </div>

                <button
                  onClick={handlePayment}
                  type="button"
                  aria-busy={isCheckingOut}
                  disabled={isCheckingOut}
                  className="group flex w-full items-center justify-between border border-[#c6b2ff] bg-[#c6b2ff] px-5 py-4 text-left text-sm font-semibold tracking-wide text-[#17151b] transition hover:bg-[#d5c8ff] disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
                >
                  <span>
                    {isCheckingOut ? "Preparing checkout..." : "Continue to checkout"}
                  </span>
                  <ArrowRight
                    size={17}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
                <p className="mb-0 mt-4 text-center text-[11px] leading-5 text-white/35">
                  Your final amount is calculated from current product data.
                </p>
              </aside>
            </div>
          )}
        </div>

        <footer className="flex min-h-12 items-center justify-between border-t border-white/10 text-[10px] tracking-wide text-white/35">
          <span>VISTYLE</span>
          <span>Demo checkout</span>
        </footer>
      </div>
    </main>
  );
};

export default CartPage;
