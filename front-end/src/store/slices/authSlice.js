import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../lib/axios";
import toast from "react-hot-toast";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error?.message || error.response?.data?.message || fallback;

const initialState = {
  user: null,
  isLoading: false,
  checkingAuth: true,
};

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return rejectWithValue("Passwords do not match");
    }

    try {
      const { data } = await axios.post("/auth/signup", formData);
      toast.success(data.message);
      return data.user;
    } catch (error) {
      const message = getErrorMessage(error, "Registration failed");
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/auth/login", { email, password });
      toast.success("Login successful");
      return data.user;
    } catch (error) {
      const message = getErrorMessage(error, "Login failed");
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post("/auth/logout");
      toast.success("Logout successful");
      return null;
    } catch (error) {
      const message = getErrorMessage(error, "Logout failed");
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/auth/profile");
      return data.user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Auth check failed"));
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.checkingAuth = false;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
        state.checkingAuth = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.checkingAuth = false;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.checkingAuth = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(checkAuth.pending, (state) => {
        state.checkingAuth = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.checkingAuth = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.checkingAuth = false;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
