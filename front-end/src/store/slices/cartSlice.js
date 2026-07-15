import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../lib/axios";
import toast from "react-hot-toast";

const initialState = {
  cart: [],
  total: 0,
};

const calculateTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const getCart = createAsyncThunk(
  "cart/getCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/cart");
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch cart",
      );
    }
  },
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (product, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/cart", { productId: product._id });
      toast.success(data.message || "Product added to cart.");
      return product;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to add product to cart.",
      );
      return rejectWithValue(
        error?.response?.data?.message || "Failed to add product to cart.",
      );
    }
  },
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (productId, { rejectWithValue }) => {
    try {
      await axios.delete(`/cart/${productId}`);
      return productId;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to remove from cart",
      );
    }
  },
);

export const updateQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      await axios.put(`/cart/${productId}`, { quantity });
      return { productId, quantity };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update quantity",
      );
    }
  },
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      await axios.delete("/cart/clear");
      return [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to clear cart",
      );
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.total = calculateTotal(action.payload);
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const existingItem = state.cart.find(
          (item) => item._id === action.payload._id,
        );
        if (existingItem) {
          state.cart = state.cart.map((item) =>
            item._id === action.payload._id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        } else {
          state.cart = [...state.cart, { ...action.payload, quantity: 1 }];
        }
        state.total = calculateTotal(state.cart);
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = state.cart.filter((item) => item._id !== action.payload);
        state.total = calculateTotal(state.cart);
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        if (action.payload.quantity < 1) {
          state.cart = state.cart.filter(
            (item) => item._id !== action.payload.productId,
          );
        } else {
          state.cart = state.cart.map((item) =>
            item._id === action.payload.productId
              ? { ...item, quantity: action.payload.quantity }
              : item,
          );
        }
        state.total = calculateTotal(state.cart);
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.total = 0;
      });
  },
});

export default cartSlice.reducer;
