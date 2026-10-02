import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, Check, LoaderCircle, RotateCw } from "lucide-react";
import axios from "../lib/axios";
import Confetti from "react-confetti";
import { getCart as getAuthoritativeCart } from "../store/slices/cartSlice";
import CheckoutResultLayout from "../components/CheckoutResultLayout";

const STATUS_CHECK_INTERVAL_MS = 2000;
const MAX_STATUS_CHECKS = 15;

const PurchaseSuccessPage = () => {
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const [status, setStatus] = useState("checking");
  const [orderId, setOrderId] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const confirmedRef = useRef(false);
  const sessionId = params.get("session_id");
  const isFulfilled = status === "fulfilled";
  const isUnauthenticated = status === "unauthenticated";
  const isError =
    status === "error" || status === "missing-session" || isUnauthenticated;
  const statusIcon = isFulfilled ? (
    <Check size={23} strokeWidth={1.6} />
  ) : isError ? (
    <AlertCircle size={23} strokeWidth={1.6} />
  ) : (
    <LoaderCircle size={23} strokeWidth={1.6} className="animate-spin" />
  );
  const statusTone = isFulfilled ? "success" : isError ? "error" : "accent";

  useEffect(() => {
    let isActive = true;
    let timeoutId;
    let checks = 0;

    const checkOrderStatus = async () => {
      if (!sessionId) {
        setStatus("missing-session");
        return;
      }

      if (confirmedRef.current) {
        return;
      }

      try {
        const { data } = await axios.get(
          `payment/success?sessionId=${encodeURIComponent(sessionId)}`,
        );
        if (!isActive) return;

        if (data.status === "fulfilled") {
          confirmedRef.current = true;
          setOrderId(data.orderId);
          setStatus("fulfilled");
          dispatch(getAuthoritativeCart());
          return;
        }

        checks += 1;
        if (checks < MAX_STATUS_CHECKS) {
          timeoutId = setTimeout(checkOrderStatus, STATUS_CHECK_INTERVAL_MS);
        } else {
          setStatus("processing");
        }
      } catch (error) {
        if (isActive) {
          setStatus(
            error.response?.status === 401 ? "unauthenticated" : "error",
          );
        }
      }
    };

    setStatus("checking");
    void checkOrderStatus();

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [dispatch, retryCount, sessionId]);

  return (
    <>
      {status === "fulfilled" && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          gravity={0.1}
          style={{ zIndex: 99 }}
          numberOfPieces={700}
          recycle={false}
        />
      )}

      <CheckoutResultLayout
        eyebrow={
          isFulfilled
            ? "Vistyle / order confirmed"
            : isError
              ? "Vistyle / payment status"
              : "Vistyle / confirming payment"
        }
        title={
          isFulfilled
            ? "Thank you."
            : isUnauthenticated
              ? "Sign in to verify."
            : status === "error"
              ? "We couldn't check."
              : status === "missing-session"
                ? "Session not found."
                : "Almost there."
        }
        description={
          isFulfilled
            ? `Your order${orderId ? ` (${orderId})` : ""} has been confirmed by our server.`
            : status === "error"
              ? "We couldn't retrieve your order status. You can try again; this page does not treat the redirect itself as proof of payment."
              : isUnauthenticated
                ? "Sign in to verify your order. The checkout redirect alone is not proof of payment."
              : status === "missing-session"
                ? "The checkout return link did not include a session. No order can be confirmed from this page."
                : "We're waiting for the verified payment event and order processing to complete. This can take a short while."
        }
        statusIcon={statusIcon}
        tone={statusTone}
      >
        <div className="flex flex-wrap gap-3">
          {!isFulfilled && !isUnauthenticated && status !== "missing-session" && (
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="inline-flex min-h-12 items-center gap-2 border border-white/20 px-5 py-3 text-sm font-medium text-[#f4f1e9] transition hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
            >
              <RotateCw size={15} aria-hidden="true" />
              Check again
            </button>
          )}
          {isUnauthenticated && sessionId ? (
            <Link
              to={`/login?returnTo=${encodeURIComponent(`/purchase-success?session_id=${sessionId}`)}`}
              className="inline-flex min-h-12 items-center border border-[#c6b2ff] bg-[#c6b2ff] px-5 py-3 text-sm font-semibold text-[#17151b] no-underline transition hover:bg-[#d5c8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
            >
              Sign in to verify
            </Link>
          ) : null}
          <Link
            to={isFulfilled ? "/products" : "/cart"}
            className="inline-flex min-h-12 items-center border border-[#c6b2ff] bg-[#c6b2ff] px-5 py-3 text-sm font-semibold text-[#17151b] no-underline transition hover:bg-[#d5c8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
          >
            {isFulfilled ? "Continue shopping" : "Return to cart"}
          </Link>
        </div>
      </CheckoutResultLayout>
    </>
  );
};

export default PurchaseSuccessPage;
