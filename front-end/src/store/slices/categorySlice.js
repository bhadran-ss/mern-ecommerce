import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axios from "../../lib/axios";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error?.message ||
  error.response?.data?.message ||
  fallback;

const initialState = {
  categories: [],
  categoriesStatus: "idle",
  categoriesError: null,
  adminCategories: [],
  adminCategoriesStatus: "idle",
  adminCategoriesError: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/categories");
      if (!Array.isArray(data.data)) {
        return rejectWithValue("The categories response was invalid.");
      }
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Categories could not be loaded."));
    }
  },
);

export const fetchAdminCategories = createAsyncThunk(
  "categories/fetchAdminCategories",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/categories/admin");
      if (!Array.isArray(data.data)) {
        return rejectWithValue("The category management response was invalid.");
      }
      return data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Category management data could not be loaded."),
      );
    }
  },
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (category, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/categories", category);
      toast.success(data.message || "Category saved.");
      return data.data;
    } catch (error) {
      const message = getErrorMessage(error, "Category could not be saved.");
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const deactivateCategory = createAsyncThunk(
  "categories/deactivateCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`/categories/${categoryId}`);
      toast.success(data.message || "Category deactivated.");
      return categoryId;
    } catch (error) {
      const message = getErrorMessage(error, "Category could not be deactivated.");
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesStatus = "loading";
        state.categoriesError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.categoriesStatus = "succeeded";
        state.categoriesError = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesStatus = "failed";
        state.categoriesError = action.payload || "Categories could not be loaded.";
      })
      .addCase(fetchAdminCategories.pending, (state) => {
        state.adminCategoriesStatus = "loading";
        state.adminCategoriesError = null;
      })
      .addCase(fetchAdminCategories.fulfilled, (state, action) => {
        state.adminCategories = action.payload;
        state.adminCategoriesStatus = "succeeded";
        state.adminCategoriesError = null;
      })
      .addCase(fetchAdminCategories.rejected, (state, action) => {
        state.adminCategoriesStatus = "failed";
        state.adminCategoriesError =
          action.payload || "Category management data could not be loaded.";
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        const category = {
          ...action.payload,
          isLegacy: false,
          isActive: true,
        };
        state.adminCategories = [
          ...state.adminCategories.filter(
            (existing) => existing.slug !== category.slug,
          ),
          category,
        ].sort((left, right) => left.name.localeCompare(right.name));
        state.categories = [
          ...state.categories.filter(
            (existing) => existing.slug !== category.slug,
          ),
          category,
        ].sort((left, right) => left.name.localeCompare(right.name));
      })
      .addCase(deactivateCategory.fulfilled, (state, action) => {
        state.adminCategories = state.adminCategories.map((category) =>
          category._id === action.payload
            ? { ...category, isActive: false }
            : category,
        );
        state.categories = state.categories.filter(
          (category) => category._id !== action.payload,
        );
      });
  },
});

export default categorySlice.reducer;
