import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../utils/api";

export const useQuestions = () => {
  return useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      const response = await api.get("/api/questions");
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useQuestion = (id) => {
  return useQuery({
    queryKey: ["question", id],
    queryFn: async () => {
      const response = await api.get(`/api/questions/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

export const useQuestionsByDocument = (documentId) => {
  return useQuery({
    queryKey: ["questions", "document", documentId],
    queryFn: async () => {
      const response = await api.get(`/api/questions/document/${documentId}`);
      return response.data.data;
    },
    enabled: !!documentId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGenerateQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, options }) => {
      const response = await api.post(
        `/api/questions/generate/${documentId}`,
        options
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({
        queryKey: ["questions", "document", variables.documentId],
      });
      toast.success(`${data.count} questions generated successfully`);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to generate questions";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/questions/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.removeQueries({ queryKey: ["question", id] });
      toast.success("Question deleted successfully");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to delete question";
      toast.error(errorMessage);
    },
  });
};

export const useBulkDeleteQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionIds) => {
      const response = await api.post("/api/questions/bulk-delete", {
        questionIds,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success(`${data.deletedCount} questions deleted successfully`);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to delete questions";
      toast.error(errorMessage);
    },
  });
};

export const useValidateAnswer = () => {
  return useMutation({
    mutationFn: async ({ questionId, userAnswer }) => {
      const response = await api.post(`/api/questions/${questionId}/validate`, {
        userAnswer,
      });
      return response.data.data; 
    },
    onSuccess: (data) => {
      if (data.result === "Correct") {
        toast.success("Correct answer!");
      } else {
        toast.error("Incorrect answer");
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to validate answer";
      toast.error(errorMessage);
    },
  });
};
