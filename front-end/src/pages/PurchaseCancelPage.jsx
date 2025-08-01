import React from 'react'

const PurchaseCancelPage = () => {
 return (
    <div className="max-w-3xl mx-auto mt-20 p-10 bg-white shadow-md rounded-xl text-center">
      <h1 className="text-2xl font-semibold text-red-600 mb-4">
        ❌ Payment Cancelled
      </h1>
      <p className="text-gray-700 mb-8">
        Your payment was not completed. If this was a mistake, please try again.
      </p>
      <button
        onClick={() => (window.location.href = "/")}
        className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition"
      >
        Return to Home
      </button>
    </div>
  );
}

export default PurchaseCancelPage
