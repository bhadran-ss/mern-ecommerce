import axios from "axios";
import { appConfig } from "../config/env.js";

const axiosInstance = axios.create({
  baseURL: appConfig.apiUrl,
  withCredentials: true,
});

export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";

let refreshPromise = null;
let refreshFailureNotified = false;

const isAuthEndpoint = (url = "") =>
  /(?:^|\/)auth\/(?:signup|login|logout|refresh-token)$/.test(
    url.split(/[?#]/, 1)[0],
  );

const isLoginOrSignupEndpoint = (url = "") =>
  /(?:^|\/)auth\/(?:signup|login)$/.test(url.split(/[?#]/, 1)[0]);

const notifySessionExpired = () => {
  if (refreshFailureNotified) return;

  refreshFailureNotified = true;
  if (typeof window === "undefined") return;

  window.dispatchEvent(new window.Event(AUTH_SESSION_EXPIRED_EVENT));
};

axiosInstance.interceptors.response.use(
  (response) => {
    if (isLoginOrSignupEndpoint(response.config?.url)) {
      refreshFailureNotified = false;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    if (refreshFailureNotified) {
      return Promise.reject(error);
    }

    if (originalRequest._authRetry) {
      notifySessionExpired();
      return Promise.reject(error);
    }

    originalRequest._authRetry = true;

    if (!refreshPromise) {
      refreshPromise = axiosInstance.post("/auth/refresh-token");
      refreshPromise.then(
        () => {
          refreshFailureNotified = false;
          refreshPromise = null;
        },
        () => {
          refreshPromise = null;
        },
      );
    }

    try {
      await refreshPromise;
      return axiosInstance(originalRequest);
    } catch {
      notifySessionExpired();
      return Promise.reject(error);
    }
  },
);

export default axiosInstance;
