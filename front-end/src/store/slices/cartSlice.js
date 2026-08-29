import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../lib/axios";
import toast from "react-hot-toast";

const initialState = {
  cart: [],
  unavailableItems: [],
  total: 0,
};

const calculateTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error?.message ||
  error.response?.data?.message ||
  fallback;

const refreshCartAfterConflict = async (error) => {
  if (error.response?.status !== 409) return null;
  try {
    const { data } = await axios.get("/cart");
    return data;
  } catch {
    return null;
  }
};

const applyAuthoritativeCart = (state, response) => {
  state.cart = Array.isArray(response?.cart) ? response.cart : [];
  state.unavailableItems = Array.isArray(response?.unavailableItems)
    ? response.unavailableItems
    : [];
  state.total = calculateTotal(state.cart);
};

const handleCartFulfilled = (state, action) =>
  applyAuthoritativeCart(state, action.payload);

export const getCart = createAsyncThunk(
  "cart/getCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/cart");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch cart"));
    }
  },
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (product, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/cart", { productId: product._id });
      toast.success(data.message || "Product added to cart.");
      return data;
    } catch (error) {
      const message = getErrorMessage(error, "Failed to add product to cart.");
      toast.error(message);
      const refreshedCart = await refreshCartAfterConflict(error);
      if (refreshedCart) return refreshedCart;
      return rejectWithValue(message);
    }
  },
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`/cart/${productId}`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to remove from cart"));
    }
  },
);

export const updateQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/cart/${productId}`, { quantity });
      return data;
    } catch (error) {
      const message = getErrorMessage(error, "Failed to update quantity");
      const refreshedCart = await refreshCartAfterConflict(error);
      if (refreshedCart) {
        toast.error(message);
        return refreshedCart;
      }
      return rejectWithValue(message);
    }
  },
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete("/cart/clear");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to clear cart"));
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCart.fulfilled, handleCartFulfilled)
      .addCase(addToCart.fulfilled, handleCartFulfilled)
      .addCase(removeFromCart.fulfilled, handleCartFulfilled)
      .addCase(updateQuantity.fulfilled, handleCartFulfilled)
      .addCase(clearCart.fulfilled, handleCartFulfilled);
  },
});

export default cartSlice.reducer;
