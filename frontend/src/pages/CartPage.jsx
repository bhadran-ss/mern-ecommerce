import React from "react";
import { Trash } from "lucide-react";
import useCartStore from "../stores/useCartStore";
import { loadStripe } from "@stripe/stripe-js";
import axios from "../lib/axios";

const CartPage = () => {
  const { cart, total, removeFromCart, updateQuantity } = useCartStore();
  const stripePromise = loadStripe(
    "pk_test_51RaVaRQq8PvEmXQmDmqqWfC4rpLQm6e0FTznkKGW7Tjx536Wl96Rm2yWeSrGAnppt2bQvFmeViG3fk4SITeqGVLl00xSwG4m37"
  );
 const handlePayment = async () => {
    const stripe = await stripePromise;
    const response = await axios.post("/payment/checkout", {
      cart,
    });
    const sessionId = response.data.id;
    console.log("response",response.data)
    const result = await stripe.redirectToCheckout({ sessionId });
    if(result.error){
      console.error("Error",result.error)
    }
  };
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      {cart.length === 0 ? (
        <div className="bg-gray-100 p-10 text-center rounded-lg">
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="text-gray-600">
            Add items to your cart to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {cart.map((item) => (
            <div
              key={item._id}
              className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 border-b py-6"
            >
              {/* Product Info */}
              <div className="flex items-center space-x-4 col-span-2">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div>
                  <h3 className="text-lg font-medium">{item.name}</h3>
                  <p className="text-gray-600">Rs. {item.price.toFixed(2)}</p>
                  <button
                    className="text-sm text-red-500 hover:underline mt-1"
                    onClick={() => removeFromCart(item._id)}
                  >
                    <Trash className="inline-block mr-1" size={16} />
                    Remove
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-center space-x-3">
                <button
                  className="px-2 py-1 border rounded hover:bg-gray-200"
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                >
                  -
                </button>
                <span className="w-6 text-center">{item.quantity}</span>
                <button
                  className="px-2 py-1 border rounded hover:bg-gray-200"
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              {/* Item Total */}
              <div className="text-center font-semibold">
                Rs. {(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="mt-10 border-t pt-6 flex flex-col md:flex-row justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold">Estimated total:</h3>
              <h2 className="text-2xl font-bold">Rs. {total.toFixed(2)}</h2>
              <p className="text-gray-500 text-sm mt-1">
                Taxes and shipping calculated at checkout.
              </p>
            </div>
            <div className="mt-4 md:mt-0 space-x-4">
              <button
                onClick={handlePayment}
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
              >
                Checkout
              </button>
             
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
