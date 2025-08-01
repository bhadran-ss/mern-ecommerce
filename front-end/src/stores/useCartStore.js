import { create } from "zustand";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";

const useCartStore = create((set, get) => ({
  cart: [],
  total: 0,

  getCart: async () => {
    try {
      const response = await axios.get("/cart");
      set({ cart: response.data });
      get().calculateTotal();
    } catch (error) {
      set({ cart: [] });
      console.error("Failed to fetch cart:", error);
    }
  },
  addToCart: async (product) => {
    try {
      const response = await axios.post("/cart", { productId: product._id });

      set((prevState) => {
        const existingItem = prevState.cart.find(
          (item) => item._id === product._id
        );
        const newCart = existingItem
          ? prevState.cart.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...prevState.cart, { ...product, quantity: 1 }];

        return { cart: newCart };
      });

      get().calculateTotal();
      toast.success(response.data.message || "Product added to cart.");
    } catch (error) {
      console.error("Add to cart failed:", error);
      toast.error(
        error?.response?.data?.message || "Failed to add product to cart."
      );
    }
  },

  calculateTotal: () => {
    set((state) => {
      const total = state.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return { total };
    });
  },
  removeFromCart: async (productId) => {
    try {
      await axios.delete(`/cart/${productId}`);
      set((prevState) => ({
        cart: prevState.cart.filter((item) => item._id !== productId),
      }));
      get().calculateTotal();
    } catch (error) {
      console.error("Remove from cart failed:", error);
    }
  },
  updateQuantity: async (productId, quantity) => {
    if (quantity < 1) {
      get().removeFromCart(productId);
      return;
    }
    try {
      await axios.put(`/cart/${productId}`, { quantity });
      set((prevState) => ({
        cart: prevState.cart.map((item) =>
          item._id === productId ? { ...item, quantity } : item
        ),
      }));
      get().calculateTotal();
    } catch (error) {
      console.error("Update quantity failed:", error);
    }
  },
 clearCart: async () => {
  try {
await axios.delete("/cart/clear");
    set({ cart: [] }); 
    get().calculateTotal(); 
  } catch (error) {
    console.log("Error caught while clearing cart:", error);
  }
},

}));

export default useCartStore;
