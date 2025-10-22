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
      toast.error(error.message);
    } finally {
      set({ isLoading: false });
    }
  },
  login: async ({ email, password }) => {
    set({ isLoading: true });
    try {
      const { data } = await axios.post("/auth/login", { email, password });
      set({ user: data.user , isLoading: false });
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
		// Prevent multiple simultaneous refresh attempts
		if (get().checkingAuth) return;

		set({ checkingAuth: true });
		try {
			const response = await axios.post("/auth/refresh-token");
			set({ checkingAuth: false });
			return response.data;
		} catch (error) {
			set({ user: null, checkingAuth: false });
			throw error;
		}
	},
}));

// TODO: Implement the axios interceptors for refreshing access token

// Axios interceptor for token refresh
let refreshPromise = null;

axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response?.status === 401 && !originalRequest._retry ) {
			originalRequest._retry = true;

			try {
				// If a refresh is already in progress, wait for it to complete
				if (refreshPromise) {
					await refreshPromise;
					return axios(originalRequest);
				}

				// Start a new refresh process
				refreshPromise = useUserStore.getState().refreshToken();
				await refreshPromise;
				refreshPromise = null;

				return axios(originalRequest);
			} catch (refreshError) {
				// If refresh fails, redirect to login or handle as needed
				useUserStore.getState().logout();
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	}
);