import axios, { type InternalAxiosRequestConfig } from "axios";

import type { AuthResponse } from "../types/user";

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

const authEndpoints = [
  "/auth/login",
  "/auth/signup",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
];

// Attach the access token to outgoing requests.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Refresh an expired access token and retry the original request.
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const isAuthEndpoint = authEndpoints.some((endpoint) =>
      originalRequest.url?.includes(endpoint),
    );

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = api
          .post<AuthResponse>("/auth/refresh", null)
          .then(({ data }) => {
            localStorage.setItem("access_token", data.access_token);

            return data.access_token;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;

      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("access_token");

      window.dispatchEvent(new Event("dochub:session-expired"));

      return Promise.reject(refreshError);
    }
  },
);

export default api;
