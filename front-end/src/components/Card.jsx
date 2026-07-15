import React from "react";
import { useNavigate } from "react-router-dom";
import { BiCartAdd } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { addToCart as addToCartThunk } from "../store/slices/cartSlice";

const Card = ({ product }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stockLeft = Number(product.stock ?? 0);
  const isOutOfStock = stockLeft <= 0;

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please log in to add items to your cart.", { id: "login" });
      return;
    }

    if (isOutOfStock) {
      toast.error("This product is currently out of stock.", { id: "stock" });
      return;
    }

    dispatch(addToCartThunk(product));
  };

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition duration-300 p-3 sm:p-4 cursor-pointer flex w-full min-w-0 flex-col justify-between items-center min-h-[360px] sm:min-h-[420px]">
      <div
        onClick={handleCardClick}
        className="w-full aspect-square overflow-hidden rounded-md hover:scale-[1.02] transition-transform duration-300 mb-3 sm:mb-4"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300"
        />
      </div>

      <div className="text-center mt-2 w-full">
        <h3 className="text-lg font-medium text-gray-800 mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gray-600">Rs {product.price}</p>
        <p
          className={`mt-2 text-xs font-semibold ${
            isOutOfStock ? "text-red-600" : "text-green-600"
          }`}
        >
          {isOutOfStock
            ? "Out of stock"
            : `${stockLeft} item${stockLeft === 1 ? "" : "s"} left`}
        </p>
      </div>

      <div className="mt-4 flex justify-center w-full">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex w-full max-w-[220px] items-center justify-center gap-2 px-4 py-2 text-sm rounded-full transition ${
            isOutOfStock
              ? "border border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
              : "border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
          }`}
        >
          <BiCartAdd size={18} />
          {isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
        </button>
      </div>
    </div>
  );
};

export default Card;
