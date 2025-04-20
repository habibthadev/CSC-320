import { defineStore } from "pinia";
import axios from "axios";

export const useAdminStore = defineStore("admin", {
  state: () => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null,
  }),
  actions: {
    async getAllUsers() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get("/api/users");
        this.users = response.data.data.users;
        return this.users;
      } catch (error) {
        this.error = error.response?.data?.message || "Failed to fetch users";
        return [];
      } finally {
        this.loading = false;
      }
    },

    async getUser(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get(`/api/users/${id}`);
        this.currentUser = response.data.data.user;
        return this.currentUser;
      } catch (error) {
        this.error = error.response?.data?.message || "Failed to fetch user";
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updateUser(id, userData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.patch(`/api/users/${id}`, userData);

        // Update user in users array
        const index = this.users.findIndex((u) => u._id === id);
        if (index !== -1) {
          this.users[index] = response.data.data.user;
        }

        return response.data.data.user;
      } catch (error) {
        this.error = error.response?.data?.message || "Failed to update user";
        return null;
      } finally {
        this.loading = false;
      }
    },

    async deleteUser(id) {
      this.loading = true;
      this.error = null;

      try {
        await axios.delete(`/api/users/${id}`);

        // Remove user from users array
        this.users = this.users.filter((u) => u._id !== id);
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || "Failed to delete user";
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
