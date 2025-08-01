import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  isLoading: false,
  checkingAuth: true,

  register: async (FormData) => {
    set({ isLoading: true });
    console.log("Registering user with data:", FormData);
    if (FormData.password !== FormData.confirmPassword) {
      toast.error("passwords do not match");
      set({ isLoading: false });
      return;
    }
    try {
      const { data } = await axios.post("/auth/signup", FormData);
      set({ user: data.user });
      toast.success("Registration successful");
    } catch (error) {
      toast.error("Registration failed");
    } finally {
      set({ isLoading: false });
    }
  },
  login: async ({ email, password }) => {
    set({ isLoading: true });
    try {
      const { data } = await axios.post("/auth/login", { email, password });
      set({ user: data.user });
      toast.success("Login successful");
    } catch (error) {
      toast.error("Login failed");
    } finally {
      set({ isLoading: false });
    }
  },
  logout: async () => {
    try {
      await axios.post("/auth/logout");
      set({ user: null });
      toast.success("Logout successful");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },
  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const { data } = await axios.get("/auth/profile");
      console.log("User:", data.user.name);
      set({ user: data.user, checkingAuth: false });
    } catch (error) {
      set({ user: null, checkingAuth: false });
    }
  },
  refreshToken: async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await axios.post("/auth/refresh-token");
      return response.data;
    } catch (error) {
      set({ user: null });
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
},
}));

let refreshPromise = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await useUserStore.getState().refreshToken();
        return axios(originalRequest);
      } catch (refreshError) {
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
