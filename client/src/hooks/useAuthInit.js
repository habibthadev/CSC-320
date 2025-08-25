import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../stores/authStore";
import api from "../utils/api";

export const useAuthInit = () => {
  const { token, refreshToken, setAuth, logout, isAuthenticated } =
    useAuthStore();


  const { data: isValid, isLoading } = useQuery({
    queryKey: ["auth", "validate"],
    queryFn: async () => {
      if (!token) return false;

      try {
        const response = await api.get("/api/auth/validate");
        return response.data.success;
      } catch (error) {
        if (error.response?.status === 401 && refreshToken) {
          try {
            const refreshResponse = await api.post("/api/auth/refresh", {
              refreshToken: refreshToken,
            });

            if (refreshResponse.data.success) {
              const newToken = refreshResponse.data.data.token;
              const newRefreshToken = refreshResponse.data.data.refreshToken;

              setAuth({
                user: useAuthStore.getState().user,
                token: newToken,
                refreshToken: newRefreshToken,
                isAuthenticated: true,
              });

              return true;
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
          }
        }

        logout();
        return false;
      }
    },
    enabled: !!token, 
    retry: false,
    staleTime: Infinity, 
  });

  useEffect(() => {
    if (!token && isAuthenticated) {
      logout();
    }
  }, [token, isAuthenticated, logout]);

  return {
    isLoading,
    isAuthenticated: !!token && isValid !== false,
  };
};
