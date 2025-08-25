import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../utils/api";

export const useDocuments = () => {
  return useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const response = await api.get("/api/documents");
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useDocument = (id) => {
  return useQuery({
    queryKey: ["document", id],
    queryFn: async () => {
      const response = await api.get(`/api/documents/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

export const useDocumentStats = () => {
  return useQuery({
    queryKey: ["document-stats"],
    queryFn: async () => {
      const response = await api.get("/api/documents/stats");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useUploadDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const response = await api.post("/api/documents", formData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document-stats"] });
      toast.success(`${data.count} document(s) uploaded successfully`);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to upload documents";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/api/documents/${id}`, data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.setQueryData(["document", data._id], data);
      toast.success("Document updated successfully");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update document";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/documents/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.removeQueries({ queryKey: ["document", id] });
      queryClient.invalidateQueries({ queryKey: ["document-stats"] });
      toast.success("Document deleted successfully");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to delete document";
      toast.error(errorMessage);
    },
  });
};

export const useBulkDeleteDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentIds) => {
      const response = await api.post("/api/documents/bulk-delete", {
        documentIds,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document-stats"] });
      toast.success(`${data.deletedCount} documents deleted successfully`);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to delete documents";
      toast.error(errorMessage);
    },
  });
};

export const useVectorizeDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await api.post(`/api/documents/${id}/vectorize`);
      return { id, data: response.data };
    },
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", id] });
      toast.success("Document vectorized successfully");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to vectorize document";
      toast.error(errorMessage);
    },
  });
};

export const useSearchDocuments = (query) => {
  return useQuery({
    queryKey: ["documents", "search", query],
    queryFn: async () => {
      const response = await api.get(
        `/api/documents/search?query=${encodeURIComponent(query)}`
      );
      return response.data.data;
    },
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000,
  });
};
