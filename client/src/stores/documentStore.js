import { create } from "zustand";
import api from "../utils/api";
import toast from "react-hot-toast";
import useAuthStore from "./authStore";

const useDocumentStore = create((set, get) => ({
  documents: [],
  currentDocument: null,
  isLoading: false,
  error: null,
  searchResults: [],

  // Get all documents
  getDocuments: async () => {
    const token = useAuthStore.getState().token;

    if (!token) {
      toast.error("You must be logged in");
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await api.get("/api/documents", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({
        documents: response.data.data,
        isLoading: false,
      });

      return response.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch documents";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  // Fetch all documents (alias for getDocuments)
  fetchDocuments: async () => {
    return get().getDocuments();
  },

  // Get document by ID
  getDocumentById: async (id) => {
    const token = useAuthStore.getState().token;

    if (!token) {
      toast.error("You must be logged in");
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await api.get(`/api/documents/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({
        currentDocument: response.data.data,
        isLoading: false,
      });

      return response.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch document";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  // Upload document
  uploadDocument: async (formData) => {
    const token = useAuthStore.getState().token;

    if (!token) {
      toast.error("You must be logged in");
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await api.post("/api/documents", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Update documents list with new document(s)
      set((state) => ({
        documents: [...state.documents, ...response.data.data],
        isLoading: false,
      }));

      toast.success(`${response.data.count} document(s) uploaded successfully`);
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to upload document";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  // Update document
  updateDocument: async (id, data) => {
    const token = useAuthStore.getState().token;

    if (!token) {
      toast.error("You must be logged in");
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await api.put(`/api/documents/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update document in the list
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc._id === id ? response.data.data : doc
        ),
        currentDocument: response.data.data,
        isLoading: false,
      }));

      toast.success("Document updated successfully");
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update document";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  // Delete document
  deleteDocument: async (id) => {
    const token = useAuthStore.getState().token;

    if (!token) {
      toast.error("You must be logged in");
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      await api.delete(`/api/documents/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove document from the list
      set((state) => ({
        documents: state.documents.filter((doc) => doc._id !== id),
        isLoading: false,
      }));

      toast.success("Document deleted successfully");
      return true;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete document";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  // Vectorize document
  vectorizeDocument: async (id) => {
    const token = useAuthStore.getState().token;

    if (!token) {
      toast.error("You must be logged in");
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await api.post(
        `/api/documents/${id}/vectorize`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update document in the list to show it's vectorized
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc._id === id ? { ...doc, vectorized: true } : doc
        ),
        currentDocument:
          state.currentDocument?._id === id
            ? { ...state.currentDocument, vectorized: true }
            : state.currentDocument,
        isLoading: false,
      }));

      toast.success("Document vectorized successfully");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to vectorize document";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  // Search documents
  searchDocuments: async (query) => {
    const token = useAuthStore.getState().token;

    if (!token) {
      toast.error("You must be logged in");
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await api.get(
        `/api/documents/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      set({
        searchResults: response.data.data,
        isLoading: false,
      });

      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Search failed";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  // Clear current document
  clearCurrentDocument: () => {
    set({ currentDocument: null });
  },

  // Clear search results
  clearSearchResults: () => {
    set({ searchResults: [] });
  },
}));

export default useDocumentStore;
