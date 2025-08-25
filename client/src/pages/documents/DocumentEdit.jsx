import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/Card";
import { useDocument, useUpdateDocument } from "../../hooks/useDocuments";
import { fadeIn } from "../../utils/animations";

const DocumentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: document, isLoading, error } = useDocument(id);
  const updateDocumentMutation = useUpdateDocument();
  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  useEffect(() => {
    if (document) {
      setTitle(document.title || "");
    }

    if (formRef.current) {
      fadeIn(formRef.current, 0.2);
    }
  }, [document]);

  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    updateDocumentMutation.mutate(
      { id, data: { title } },
      {
        onSuccess: () => {
          toast.success("Document updated successfully");
          navigate(`/documents/${id}`);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update document");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Document Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The document you're trying to edit doesn't exist or has been
            deleted.
          </p>
          <Button onClick={() => navigate("/documents")}>
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/documents/${id}`)}
            icon={ArrowLeft}
            className="mr-4"
          ></Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Document
          </h1>
        </div>

        <Card ref={formRef}>
          <CardHeader>
            <CardTitle>Edit Document Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" required>
                  Document Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={errors.title}
                />
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Document Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Original Filename:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {document.originalFileName}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      File Type:
                    </span>
                    <p className="text-gray-900 dark:text-white truncate">
                      {document.fileType}
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate(`/documents/${id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              isLoading={updateDocumentMutation.isPending}
              icon={Save}
            >
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DocumentEdit;
