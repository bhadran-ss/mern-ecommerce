import React from "react";
import { useNavigate } from "react-router-dom";
import { BiCartAdd } from "react-icons/bi";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";
import useCartStore from "../stores/useCartStore";


const Card = ({ product }) => {
  const { user } = useUserStore();
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please log in to add items to your cart.", { id: "login" });
      return;
    } else {
      addToCart(product);
    }
  };
  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition duration-300 p-4 cursor-pointer h-[420px] flex flex-col justify-between items-center">
      {/* Product Image */}
      <div
        onClick={handleCardClick}
        className="aspect-square overflow-hidden rounded-md hover:scale-105 transition-transform duration-300 mb-4"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product Details */}
      <div className="text-center mt-4">
        <h1 className="text-lg font-medium text-gray-800 mb-1 line-clamp-2">
          {product.name}
        </h1>
        <p className="text-gray-600">Rs {product.price}</p>
      </div>

      {/* Add to Cart Button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={handleAddToCart}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-800 text-gray-800 rounded-full hover:bg-gray-800 hover:text-white transition"
        >
          <BiCartAdd size={18} />
          ADD TO CART
        </button>
      </div>
    </div>
  );
};

export default Card;
