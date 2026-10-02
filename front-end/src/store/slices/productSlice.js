import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../lib/axios";
import toast from "react-hot-toast";

const initialState = {
  products: [],
  allProductsStatus: "idle",
  allProductsError: null,
  sellerProducts: [],
  sellerProductsLoading: false,
  sellerProductsError: null,
  loading: false,
  categoryProducts: [],
  categoryProductsStatus: "idle",
  categoryProductsError: null,
  categoryProductsRequestId: null,
  detailedProduct: null,
  detailedProductStatus: "idle",
  detailedProductError: null,
  detailedProductRequestId: null,
  featuredProducts: [],
  searchResult: [],
  searchStatus: "idle",
  searchError: null,
  searchRequestId: null,
};

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (product, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/products", product);
      toast.success("Product created successfully");
      return data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to create product";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const fetchAllProducts = createAsyncThunk(
  "products/fetchAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/products");
      if (!Array.isArray(data.data)) {
        return rejectWithValue("The products response was invalid.");
      }
      return data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch products";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const fetchSellerProducts = createAsyncThunk(
  "products/fetchSellerProducts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/products/mine");
      if (!Array.isArray(data.data)) {
        return rejectWithValue("The seller products response was invalid.");
      }
      return data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch your products";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const fetchProduct = createAsyncThunk(
  "products/fetchProduct",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/products/${id}`);
      if (
        !data.data ||
        typeof data.data !== "object" ||
        Array.isArray(data.data)
      ) {
        return rejectWithValue("The product response was invalid.");
      }
      return data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch product details";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const getSearchResult = createAsyncThunk(
  "products/getSearchResult",
  async (searchTerm, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `/products/search?name=${encodeURIComponent(searchTerm)}`,
      );
      if (!Array.isArray(data.data)) {
        return rejectWithValue("The search response was invalid.");
      }
      return data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Search failed";
      return rejectWithValue(message);
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
      const { data } = await axios.get(
        `/categories/products/${encodeURIComponent(category)}`,
      );
      if (!Array.isArray(data.data)) {
        return rejectWithValue("The category response was invalid.");
      }
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to fetch products by category",
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
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to delete product";
      toast.error(message);
      return rejectWithValue(message);
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
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to update featured status";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearSearchResult: (state) => {
      state.searchResult = [];
      state.searchStatus = "idle";
      state.searchError = null;
      state.searchRequestId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
        state.sellerProducts.push(action.payload);
        state.loading = false;
      })
      .addCase(createProduct.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchAllProducts.pending, (state) => {
        state.allProductsStatus = "loading";
        state.allProductsError = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.allProductsStatus = "succeeded";
        state.allProductsError = null;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.allProductsStatus = "failed";
        state.allProductsError =
          action.payload || "Failed to fetch products";
      })
      .addCase(fetchSellerProducts.pending, (state) => {
        state.sellerProductsLoading = true;
        state.sellerProductsError = null;
      })
      .addCase(fetchSellerProducts.fulfilled, (state, action) => {
        state.sellerProducts = action.payload;
        state.sellerProductsLoading = false;
        state.sellerProductsError = null;
      })
      .addCase(fetchSellerProducts.rejected, (state, action) => {
        state.sellerProductsLoading = false;
        state.sellerProductsError =
          action.payload || "Failed to fetch your products";
      })
      .addCase(fetchProduct.pending, (state, action) => {
        state.detailedProductRequestId = action.meta.requestId;
        state.detailedProduct = null;
        state.detailedProductStatus = "loading";
        state.detailedProductError = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        if (state.detailedProductRequestId !== action.meta.requestId) return;
        state.detailedProduct = action.payload;
        state.detailedProductStatus = "succeeded";
        state.detailedProductError = null;
        state.detailedProductRequestId = null;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        if (state.detailedProductRequestId !== action.meta.requestId) return;
        state.detailedProduct = null;
        state.detailedProductStatus = "failed";
        state.detailedProductError =
          action.payload || "Failed to fetch product details";
        state.detailedProductRequestId = null;
      })
      .addCase(getSearchResult.pending, (state, action) => {
        state.searchResult = [];
        state.searchStatus = "loading";
        state.searchError = null;
        state.searchRequestId = action.meta.requestId;
      })
      .addCase(getSearchResult.fulfilled, (state, action) => {
        if (state.searchRequestId !== action.meta.requestId) return;
        state.searchResult = action.payload;
        state.searchStatus = "succeeded";
        state.searchError = null;
        state.searchRequestId = null;
      })
      .addCase(getSearchResult.rejected, (state, action) => {
        if (state.searchRequestId !== action.meta.requestId) return;
        state.searchResult = [];
        state.searchStatus = "failed";
        state.searchError = action.payload || "Search failed";
        state.searchRequestId = null;
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
      .addCase(fetchProductByCategory.pending, (state, action) => {
        state.categoryProductsStatus = "loading";
        state.categoryProductsError = null;
        state.categoryProductsRequestId = action.meta.requestId;
      })
      .addCase(fetchProductByCategory.fulfilled, (state, action) => {
        if (state.categoryProductsRequestId !== action.meta.requestId) return;
        state.categoryProducts = action.payload;
        state.categoryProductsStatus = "succeeded";
        state.categoryProductsError = null;
        state.categoryProductsRequestId = null;
      })
      .addCase(fetchProductByCategory.rejected, (state, action) => {
        if (state.categoryProductsRequestId !== action.meta.requestId) return;
        state.categoryProductsStatus = "failed";
        state.categoryProductsError =
          action.payload || "Failed to fetch products by category";
        state.categoryProductsRequestId = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(
          (product) => product._id !== action.payload,
        );
        state.sellerProducts = state.sellerProducts.filter(
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
