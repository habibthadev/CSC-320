import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../utils/api";
import toast from "react-hot-toast";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/api/auth/register", userData);
          const { token, refreshToken, ...user } = response.data;

          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success("Registration successful!");
          return true;
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Registration failed";
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return false;
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/api/auth/login", credentials);
          const { token, refreshToken, ...user } = response.data;

          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success("Login successful!");
          return true;
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Login failed";
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        toast.success("Logged out successfully");
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/api/auth/forgot-password", {
            email,
          });
          set({ isLoading: false });
          toast.success("Password reset OTP sent to your email");
          return response.data;
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Failed to send reset OTP";
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return false;
        }
      },

      verifyOTP: async (email, otp) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/api/auth/verify-otp", {
            email,
            otp,
          });
          set({ isLoading: false });
          toast.success("OTP verified successfully");
          return response.data;
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Invalid or expired OTP";
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return false;
        }
      },

      resetPassword: async (email, otp, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/api/auth/reset-password", {
            email,
            otp,
            password,
          });

          const { token, refreshToken } = response.data;

          set({
            token,
            refreshToken,
            isLoading: false,
          });

          toast.success("Password reset successful");
          return true;
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Password reset failed";
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return false;
        }
      },

      resetPasswordWithToken: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/api/auth/reset-password-token", {
            token,
            password,
          });

          const { token: authToken, refreshToken } = response.data;

          set({
            token: authToken,
            refreshToken,
            isLoading: false,
          });

          toast.success("Password reset successful");
          return { success: true };
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Password reset failed";
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      refreshAuthToken: async () => {
        const currentRefreshToken = get().refreshToken;

        if (!currentRefreshToken) {
          return false;
        }

        try {
          const response = await api.post("/api/auth/refresh-token", {
            refreshToken: currentRefreshToken,
          });

          set({ token: response.data.token });
          return true;
        } catch (error) {
          // If refresh token is invalid, log the user out
          get().logout();
          return false;
        }
      },

      updateProfile: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put("/api/auth/profile", userData, {
            headers: {
              Authorization: `Bearer ${get().token}`,
            },
          });

          const { token, ...user } = response.data;

          set({
            user,
            token,
            isLoading: false,
          });

          toast.success("Profile updated successfully");
          return true;
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Failed to update profile";
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return false;
        }
      },

      getProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get("/api/auth/profile", {
            headers: {
              Authorization: `Bearer ${get().token}`,
            },
          });

          set({
            user: response.data,
            isLoading: false,
          });

          return response.data;
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Failed to fetch profile";
          set({ error: errorMessage, isLoading: false });

          // If unauthorized, log the user out
          if (error.response?.status === 401) {
            get().logout();
          }

          return null;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
