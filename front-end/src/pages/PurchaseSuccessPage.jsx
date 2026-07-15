import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import axios from "../lib/axios";
import Confetti from "react-confetti";
import { clearCart } from "../store/slices/cartSlice";

const PurchaseSuccessPage = () => {
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const [hasCalled, setHasCalled] = useState(false);

  useEffect(() => {
    const handleCheckoutSession = async () => {
      if (hasCalled) {
        return;
      } else {
        const sessionId = params.get("session_id");
        if (sessionId) {
          try {
            const response = await axios.post(
              `payment/success?sessionId=${sessionId}`,
            );
            dispatch(clearCart());
            setHasCalled(true);
          } catch (error) {
            console.error("Error creating order:", error);
          }
        }
      }
    };
    handleCheckoutSession();
  }, [clearCart]);

  return (
    <div className="h-screen flex items-center justify-center px-4">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        style={{ zIndex: 99 }}
        numberOfPieces={700}
        recycle={false}
      />

      <div className="max-w-3xl mx-auto mt-20 p-10 bg-white shadow-md rounded-xl text-center">
        <h1 className="text-2xl font-semibold text-green-600 mb-4">
          🎉 Payment Successful!
        </h1>
        <p className="text-gray-700 mb-8">
          Thank you for your purchase. Your order has been confirmed.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;
