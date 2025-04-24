import { create } from "zustand";
import api from "../utils/api";
import toast from "react-hot-toast";
import useAuthStore from "./authStore";

const useRagStore = create((set, get) => ({
  chatHistory: {},
  currentResponse: null,
  isLoading: false,
  error: null,

  // Chat with a single document
  chatWithDocument: async (documentId, query) => {
    const token = useAuthStore.getState().token;

    if (!token) {
      toast.error("You must be logged in");
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await api.post(
        `/api/rag/chat/${documentId}`,
        {
          query,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const chatData = response.data.data;

      // Add to chat history for this document
      set((state) => {
        const documentChat = state.chatHistory[documentId] || [];

        return {
          chatHistory: {
            ...state.chatHistory,
            [documentId]: [
              ...documentChat,
              {
                query: chatData.query,
                response: chatData.response,
                timestamp: new Date().toISOString(),
              },
            ],
          },
          currentResponse: chatData.response,
          isLoading: false,
        };
      });

      return chatData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Chat failed";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  // Chat with multiple documents
  chatWithMultipleDocuments: async (documentIds, query) => {
    const token = useAuthStore.getState().token;

    if (!token) {
      toast.error("You must be logged in");
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await api.post(
        "/api/rag/chat",
        {
          documentIds,
          query,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const chatData = response.data.data;

      // Create a unique key for this multi-document chat
      const multiDocKey = `multi_${documentIds.sort().join("_")}`;

      // Add to chat history for this multi-document combination
      set((state) => {
        const multiDocChat = state.chatHistory[multiDocKey] || [];

        return {
          chatHistory: {
            ...state.chatHistory,
            [multiDocKey]: [
              ...multiDocChat,
              {
                query: chatData.query,
                response: chatData.response,
                documentsUsed: chatData.documentsUsed,
                timestamp: new Date().toISOString(),
              },
            ],
          },
          currentResponse: chatData.response,
          isLoading: false,
        };
      });

      return chatData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Chat failed";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  // Get chat history for a document
  getChatHistoryForDocument: (documentId) => {
    return get().chatHistory[documentId] || [];
  },

  // Get chat history for multiple documents
  getChatHistoryForMultipleDocuments: (documentIds) => {
    const multiDocKey = `multi_${documentIds.sort().join("_")}`;
    return get().chatHistory[multiDocKey] || [];
  },

  // Clear chat history for a document
  clearChatHistoryForDocument: (documentId) => {
    set((state) => {
      const newChatHistory = { ...state.chatHistory };
      delete newChatHistory[documentId];

      return { chatHistory: newChatHistory };
    });
  },

  // Clear all chat history
  clearAllChatHistory: () => {
    set({ chatHistory: {} });
  },

  // Clear chat history (alias for clearAllChatHistory)
  clearChatHistory: () => {
    set({ chatHistory: {} });
  },

  // Clear current response
  clearCurrentResponse: () => {
    set({ currentResponse: null });
  },
}));

export default useRagStore;
