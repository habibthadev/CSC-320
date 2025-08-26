import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../utils/api";

export const useChatWithDocument = () => {
  return useMutation({
    mutationFn: async ({ documentId, query, conversationHistory = [] }) => {
      const response = await api.post(`/api/rag/chat/${documentId}`, {
        query,
        conversationHistory,
      });
      return response.data.data;
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Chat failed";
      toast.error(errorMessage);
    },
  });
};

export const useChatWithMultipleDocuments = () => {
  return useMutation({
    mutationFn: async ({ documentIds, query, conversationHistory = [] }) => {
      const response = await api.post("/api/rag/chat", {
        documentIds,
        query,
        conversationHistory,
      });
      return response.data.data;
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Chat failed";
      toast.error(errorMessage);
    },
  });
};

export const useGeneralChat = () => {
  return useMutation({
    mutationFn: async ({ query, conversationHistory = [] }) => {
      const response = await api.post("/api/rag/general-chat", {
        message: query,
        conversationHistory,
      });
      return response.data.data;
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Chat failed";
      toast.error(errorMessage);
    },
  });
};
