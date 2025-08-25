import axios from "axios";
import useAuthStore from "../stores/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!config.headers["Content-Type"] && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) {
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }

        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3001"
          }/api/auth/refresh`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          }
        );

        if (!response.ok) {
          throw new Error("Token refresh failed");
        }

        const data = await response.json();

        if (data.success && data.data) {
          useAuthStore.getState().setAuth({
            user: useAuthStore.getState().user,
            token: data.data.token,
            refreshToken: data.data.refreshToken,
            isAuthenticated: true,
          });

          originalRequest.headers.Authorization = `Bearer ${data.data.token}`;
          return api(originalRequest);
        } else {
          throw new Error("Invalid refresh response");
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
