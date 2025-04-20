import { defineStore } from "pinia";
import axios from "axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === "admin",
  },
  actions: {
    async signup(userData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post("/api/users/signup", userData);
        this.token = response.data.token;
        this.user = response.data.data.user;

        localStorage.setItem("token", this.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;

        return true;
      } catch (error) {
        this.error = error.response?.data?.message || "Registration failed";
        return false;
      } finally {
        this.loading = false;
      }
    },

    async login(credentials) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post("/api/users/login", credentials);
        this.token = response.data.token;
        this.user = response.data.data.user;

        localStorage.setItem("token", this.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;

        return true;
      } catch (error) {
        this.error = error.response?.data?.message || "Login failed";
        return false;
      } finally {
        this.loading = false;
      }
    },

    async googleLogin() {
      window.location.href = "/api/users/auth/google";
    },

    async logout() {
      this.loading = true;

      try {
        await axios.get("/api/users/logout");
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        this.token = null;
        this.user = null;
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        this.loading = false;
      }
    },

    async forgotPassword(email) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post("/api/users/forgotPassword", {
          email,
        });
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || "Failed to send reset email";
        return false;
      } finally {
        this.loading = false;
      }
    },

    async verifyOTP(data) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post("/api/users/verifyOTP", data);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || "Invalid OTP";
        return false;
      } finally {
        this.loading = false;
      }
    },

    async resetPassword(data) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post("/api/users/resetPassword", data);
        this.token = response.data.token;
        this.user = response.data.data.user;

        localStorage.setItem("token", this.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;

        return true;
      } catch (error) {
        this.error =
          error.response?.data?.message || "Failed to reset password";
        return false;
      } finally {
        this.loading = false;
      }
    },

    async updatePassword(passwordData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.patch(
          "/api/users/updateMyPassword",
          passwordData
        );
        this.token = response.data.token;

        localStorage.setItem("token", this.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;

        return true;
      } catch (error) {
        this.error =
          error.response?.data?.message || "Failed to update password";
        return false;
      } finally {
        this.loading = false;
      }
    },

    async getProfile() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get("/api/users/me");
        this.user = response.data.data.user;
        return this.user;
      } catch (error) {
        this.error = error.response?.data?.message || "Failed to get profile";
        if (error.response?.status === 401) {
          this.logout();
        }
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(userData) {
      this.loading = true;
      this.error = null;

      try {
        const formData = new FormData();
        for (const key in userData) {
          if (userData[key] !== undefined) {
            formData.append(key, userData[key]);
          }
        }

        const response = await axios.patch("/api/users/updateMe", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        this.user = response.data.data.user;
        return this.user;
      } catch (error) {
        this.error =
          error.response?.data?.message || "Failed to update profile";
        return null;
      } finally {
        this.loading = false;
      }
    },

    async deleteAccount() {
      this.loading = true;

      try {
        await axios.delete("/api/users/deleteMe");
        this.logout();
        return true;
      } catch (error) {
        this.error =
          error.response?.data?.message || "Failed to delete account";
        return false;
      } finally {
        this.loading = false;
      }
    },

    init() {
      if (this.token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
        this.getProfile();
      }
    },
  },
});
