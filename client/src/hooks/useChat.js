import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../utils/api";

export const useChatWithDocument = () => {
  return useMutation({
    mutationFn: async ({ documentId, query }) => {
      const response = await api.post(`/api/rag/chat/${documentId}`, { query });
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
    mutationFn: async ({ documentIds, query }) => {
      const response = await api.post("/api/rag/chat", { documentIds, query });
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
    mutationFn: async ({ query }) => {
      const response = await api.post("/api/rag/general-chat", {
        message: query,
      });
      return response.data.data;
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Chat failed";
      toast.error(errorMessage);
    },
  });
};
