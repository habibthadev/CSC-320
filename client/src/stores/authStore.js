import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: ({ user, token, refreshToken, isAuthenticated = true }) => {
        set({
          user,
          token,
          refreshToken,
          isAuthenticated,
        });
      },

      setUser: (user) => {
        set({ user });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshAuthToken: async () => {
        const currentRefreshToken = get().refreshToken;

        if (!currentRefreshToken) {
          return { success: false };
        }

        try {
          const response = await fetch(
            `${
              import.meta.env.VITE_API_URL || "http://localhost:3001"
            }/api/auth/refresh`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ refreshToken: currentRefreshToken }),
            }
          );

          if (!response.ok) {
            throw new Error("Token refresh failed");
          }

          const data = await response.json();

          if (data.success && data.data) {
            set({
              token: data.data.token,
              refreshToken: data.data.refreshToken,
            });
            return { success: true };
          } else {
            throw new Error("Invalid refresh response");
          }
        } catch (error) {
          console.error("Token refresh error:", error);
          get().logout();
          return { success: false };
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
