import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../lib/axios";
import toast from "react-hot-toast";

const initialState = {
  products: [],
  loading: false,
  categoryProducts: [],
  detailedProduct: null,
  featuredProducts: [],
  searchResult: [],
};

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (product, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/products", product);
      toast.success("Product created successfully");
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create product");
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product",
      );
    }
  },
);

export const fetchAllProducts = createAsyncThunk(
  "products/fetchAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/products");
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch products");
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products",
      );
    }
  },
);

export const fetchProduct = createAsyncThunk(
  "products/fetchProduct",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/products/${id}`);
      return data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch product details",
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product details",
      );
    }
  },
);

export const getSearchResult = createAsyncThunk(
  "products/getSearchResult",
  async (searchTerm, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/products/search?name=${searchTerm}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Search failed");
    }
  },
);

export const getFeaturedProducts = createAsyncThunk(
  "products/getFeaturedProducts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/products/featured");
      return data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch featured products",
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch featured products",
      );
    }
  },
);

export const fetchProductByCategory = createAsyncThunk(
  "products/fetchProductByCategory",
  async (category, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/products/category/${category}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products by category",
      );
    }
  },
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (productId, { rejectWithValue }) => {
    try {
      await axios.delete(`/products/${productId}`);
      toast.success("Product deleted successfully");
      return productId;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product",
      );
    }
  },
);

export const toggleFeatured = createAsyncThunk(
  "products/toggleFeatured",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`/products/${productId}/feature`);
      toast.success("Product featured status updated");
      return {
        productId,
        isFeatured: data.data?.isFeatured ?? data.isFeatured ?? false,
      };
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update featured status",
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to update featured status",
      );
    }
  },
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearSearchResult: (state) => {
      state.searchResult = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
        state.loading = false;
      })
      .addCase(createProduct.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllProducts.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.detailedProduct = action.payload;
        state.loading = false;
      })
      .addCase(fetchProduct.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getSearchResult.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSearchResult.fulfilled, (state, action) => {
        state.searchResult = action.payload;
        state.loading = false;
      })
      .addCase(getSearchResult.rejected, (state) => {
        state.searchResult = [];
        state.loading = false;
      })
      .addCase(getFeaturedProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload;
        state.loading = false;
      })
      .addCase(getFeaturedProducts.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchProductByCategory.fulfilled, (state, action) => {
        state.categoryProducts = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(
          (product) => product._id !== action.payload,
        );
      })
      .addCase(toggleFeatured.fulfilled, (state, action) => {
        state.products = state.products.map((product) =>
          product._id === action.payload.productId
            ? { ...product, isFeatured: action.payload.isFeatured }
            : product,
        );
        if (action.payload.isFeatured) {
          const product = state.products.find(
            (item) => item._id === action.payload.productId,
          );
          if (
            product &&
            !state.featuredProducts.some((item) => item._id === product._id)
          ) {
            state.featuredProducts.push(product);
          }
        } else {
          state.featuredProducts = state.featuredProducts.filter(
            (product) => product._id !== action.payload.productId,
          );
        }
      });
  },
});

export const { clearSearchResult } = productSlice.actions;
export default productSlice.reducer;
