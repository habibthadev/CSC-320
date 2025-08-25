import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import useAuthStore from "../stores/authStore";

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    setAuth,
    logout: storeLogout,
    setLoading,
    setError,
  } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    logout: storeLogout,
    setLoading,
    setError,
  };
};

export const useRegister = () => {
  const { setAuth, setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await api.post("/api/auth/register", userData);
      return response.data;
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      const responseData = data.data || data;
      const { token, refreshToken, ...user } = responseData;

      setAuth({ user, token, refreshToken, isAuthenticated: true });
      setLoading(false);
      toast.success("Registration successful!");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      setError(errorMessage);
      setLoading(false);
      toast.error(errorMessage);
    },
  });
};

export const useLogin = () => {
  const { setAuth, setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials) => {
      const response = await api.post("/api/auth/login", credentials);
      return response.data;
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      const responseData = data.data || data;
      const { token, refreshToken, ...user } = responseData;

      setAuth({ user, token, refreshToken, isAuthenticated: true });
      setLoading(false);
      toast.success("Login successful!");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Login failed";
      setError(errorMessage);
      setLoading(false);
      toast.error(errorMessage);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await api.post("/api/auth/logout");
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success("Logged out successfully");
    },
    onError: () => {
      logout();
      queryClient.clear();
      toast.success("Logged out successfully");
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email) => {
      const response = await api.post("/api/auth/forgot-password", { email });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password reset OTP sent to your email");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to send reset OTP";
      toast.error(errorMessage);
    },
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: async ({ email, otp }) => {
      const response = await api.post("/api/auth/verify-otp", { email, otp });
      return response.data;
    },
    onSuccess: () => {
      toast.success("OTP verified successfully");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Invalid or expired OTP";
      toast.error(errorMessage);
    },
  });
};

export const useResetPassword = () => {
  const { setAuth, setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: async ({ email, otp, password }) => {
      const response = await api.post("/api/auth/reset-password", {
        email,
        otp,
        password,
      });
      return response.data;
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      const { token, refreshToken } = data;
      setAuth({ token, refreshToken });
      setLoading(false);
      toast.success("Password reset successful");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Password reset failed";
      setError(errorMessage);
      setLoading(false);
      toast.error(errorMessage);
    },
  });
};

export const useProfile = () => {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/api/auth/profile");
      return response.data;
    },
    enabled: !!token && isAuthenticated,
    staleTime: 10 * 60 * 1000,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user, setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await api.put("/api/auth/profile", userData);
      return response.data;
    },
    onSuccess: (data) => {
      const { token, ...updatedUser } = data;
      setAuth({ user: updatedUser, token });
      queryClient.setQueryData(["profile"], updatedUser);
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await api.delete("/api/auth/account");
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success("Account deleted successfully");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to delete account";
      toast.error(errorMessage);
    },
  });
};
