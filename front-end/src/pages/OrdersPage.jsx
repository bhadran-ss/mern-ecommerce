import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ClipboardList } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import axios from "../lib/axios";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

const formatAmount = (minorUnits) =>
  Number.isSafeInteger(minorUnits)
    ? currencyFormatter.format(minorUnits / 100)
    : "Amount unavailable";

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
};

const statusStyles = {
  Pending: "border-amber-300/25 bg-amber-300/[0.08] text-amber-100",
  Completed: "border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-200",
  Cancelled: "border-rose-300/25 bg-rose-300/[0.08] text-rose-200",
};

const OrderStatus = ({ status }) => (
  <span
    className={`inline-flex border px-2.5 py-1 text-xs font-medium ${
      statusStyles[status] || "border-white/15 bg-white/[0.04] text-white/65"
    }`}
  >
    {status === "Pending"
      ? "Payment processing"
      : status === "Completed"
        ? "Confirmed"
        : status}
  </span>
);

const OrdersPage = () => {
  const { orderId } = useParams();
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const loadOrders = useCallback(async (signal) => {
    const response = await axios.get("/orders", { signal });
    return response.data.orders;
  }, []);

  const loadOrder = useCallback(
    async (id, signal) => {
      const response = await axios.get(`/orders/${encodeURIComponent(id)}`, {
        signal,
      });
      return response.data.order;
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    const load = async () => {
      setIsLoading(true);
      setError("");
      setOrder(null);
      try {
        if (orderId) {
          const result = await loadOrder(orderId, controller.signal);
          if (isActive) setOrder(result);
        } else {
          const result = await loadOrders(controller.signal);
          if (isActive) setOrders(result);
        }
      } catch (requestError) {
        if (isActive && requestError.name !== "CanceledError") {
          setError(
            requestError.response?.data?.error?.message ||
              "We couldn't load your order information. Please try again.",
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [loadOrder, loadOrders, orderId, retry]);

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

        <div className="mx-auto w-full max-w-5xl flex-1 py-10 md:py-14 xl:py-16">
        <Link
          to={orderId ? "/orders" : "/products"}
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {orderId ? "All orders" : "Continue shopping"}
        </Link>

        <section className="mb-8 border-b border-white/10 pb-6 sm:mb-10">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c6b2ff]">
            Vistyle / account
          </p>
          <h1 className="mb-3 font-serif text-4xl font-light leading-tight tracking-[-0.04em] text-[#f4f1e9] sm:text-5xl">
            {orderId ? "Order details." : "Your orders."}
          </h1>
          <p className="mb-0 max-w-2xl text-sm leading-6 text-white/55">
            {orderId
              ? "Purchase details and status recorded by Vistyle."
              : "A record of orders confirmed for your account."}
          </p>
        </section>

        {isLoading ? (
          <div
            className="border border-white/10 bg-[#181815]/70 p-6 text-sm text-white/60"
            role="status"
            aria-live="polite"
          >
            Loading order information...
          </div>
        ) : error ? (
          <section
            className="border border-rose-300/25 bg-rose-300/[0.06] p-6 sm:p-8"
            role="alert"
          >
            <h2 className="mb-2 font-serif text-2xl font-light text-[#f4f1e9]">
              Order information unavailable.
            </h2>
            <p className="mb-5 text-sm leading-6 text-white/60">{error}</p>
            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="border border-[#c6b2ff] bg-[#c6b2ff] px-5 py-3 text-sm font-semibold text-[#17151b] transition hover:bg-[#d5c8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
            >
              Try again
            </button>
          </section>
        ) : orderId && order ? (
          <OrderDetail order={order} />
        ) : orderId ? (
          <section className="border border-white/10 bg-[#181815]/70 p-8">
            <p className="mb-5 text-sm text-white/60">
              This order is unavailable for your account.
            </p>
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#d9ccff] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
            >
              View your orders <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </section>
        ) : orders.length === 0 ? (
          <section className="flex min-h-72 flex-col items-center justify-center border border-white/10 bg-[#181815]/70 px-6 py-12 text-center">
            <span className="mb-5 grid h-14 w-14 place-items-center border border-[#c6b2ff]/35 bg-[#c6b2ff]/[0.05] text-[#d9ccff]">
              <ClipboardList size={22} aria-hidden="true" />
            </span>
            <h2 className="mb-3 font-serif text-3xl font-light text-[#f4f1e9]">
              No confirmed orders yet.
            </h2>
            <p className="mb-6 max-w-md text-sm leading-6 text-white/55">
              Once a payment is verified and an order is created, it will appear
              here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 border border-[#c6b2ff] bg-[#c6b2ff] px-5 py-3 text-sm font-semibold text-[#17151b] transition hover:bg-[#d5c8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
            >
              Browse the shop <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </section>
        ) : (
          <div className="space-y-4">
            {orders.map((item) => (
              <article
                key={item.id}
                className="border border-white/10 bg-[#181815]/70 p-5 sm:p-7"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                      Order
                    </p>
                    <h2 className="mb-1 break-all font-mono text-sm font-medium text-[#f4f1e9]">
                      {item.id}
                    </h2>
                    <p className="mb-0 text-xs text-white/45">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <OrderStatus status={item.status} />
                </div>
                <div className="flex flex-wrap items-end justify-between gap-4 pt-5">
                  <div>
                    <p className="mb-1 text-xs text-white/45">
                      {item.products.length}{" "}
                      {item.products.length === 1 ? "item" : "items"}
                    </p>
                    <p className="mb-0 font-medium text-[#f4f1e9]">
                      {formatAmount(item.totalAmountMinorUnits)}
                    </p>
                  </div>
                  <Link
                    to={`/orders/${item.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#d9ccff] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
                  >
                    View details <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
        </div>

        <footer className="flex min-h-12 items-center justify-between border-t border-white/10 text-[10px] tracking-wide text-white/35">
          <span>VISTYLE</span>
          <span>Order history</span>
        </footer>
      </div>
    </main>
  );
};

const OrderDetail = ({ order }) => (
  <article className="border border-white/10 bg-[#181815]/70 p-5 sm:p-8">
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
          Order reference
        </p>
        <p className="mb-2 break-all font-mono text-sm text-[#f4f1e9]">{order.id}</p>
        <p className="mb-0 text-xs text-white/45">{formatDate(order.createdAt)}</p>
      </div>
      <OrderStatus status={order.status} />
    </div>

    {order.status === "Pending" && (
      <p
        className="mb-6 border border-amber-300/25 bg-amber-300/[0.08] p-4 text-sm leading-6 text-amber-100"
        role="status"
      >
        Payment is still processing. An order is not confirmed until payment
        verification and fulfilment are complete.
      </p>
    )}
    {order.status === "Cancelled" && (
      <p className="mb-6 border border-rose-300/25 bg-rose-300/[0.06] p-4 text-sm leading-6 text-rose-200">
        This order is marked cancelled. Contact support if you need help.
      </p>
    )}

    <h2 className="mb-4 font-serif text-2xl font-light text-[#f4f1e9]">Items in this order.</h2>
    <ul className="mb-6 divide-y divide-white/10 border-y border-white/10">
      {order.products.map((item, index) => (
        <li
          key={`${item.productId}-${index}`}
          className="flex flex-wrap items-start justify-between gap-3 py-4"
        >
          <div className="min-w-0">
            <p className="mb-1 break-words font-medium text-[#f4f1e9]">{item.name}</p>
            <p className="mb-0 text-sm text-white/55">
              Quantity {item.quantity} · {formatAmount(item.unitAmountMinorUnits)}{" "}
              each
            </p>
          </div>
          <p className="mb-0 shrink-0 text-sm font-medium text-[#f4f1e9]">
            {formatAmount(item.lineTotalMinorUnits)}
          </p>
        </li>
      ))}
    </ul>

    <div className="ml-auto flex max-w-sm justify-between gap-6 text-base font-semibold text-[#f4f1e9]">
      <span>Order total</span>
      <span>{formatAmount(order.totalAmountMinorUnits)}</span>
    </div>
    <p className="mb-0 mt-4 text-xs leading-5 text-white/40">
      Product names and prices shown are the purchase-time order record. This
      page does not represent shipping or delivery status.
    </p>
  </article>
);

export default OrdersPage;
