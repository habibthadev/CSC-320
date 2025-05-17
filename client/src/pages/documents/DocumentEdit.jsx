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
import useDocumentStore from "../../stores/documentStore";
import { fadeIn } from "../../utils/animations";

const DocumentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getDocumentById,
    updateDocument,
    isLoading,
    currentDocument,
    clearCurrentDocument,
  } = useDocumentStore();
  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  useEffect(() => {
    getDocumentById(id);

    return () => {
      clearCurrentDocument();
    };
  }, [id, getDocumentById, clearCurrentDocument]);

  useEffect(() => {
    if (currentDocument) {
      setTitle(currentDocument.title || "");
    }

    if (formRef.current) {
      fadeIn(formRef.current, 0.2);
    }
  }, [currentDocument]);

  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const { isLoading: isPending, error } = await updateDocument(id, { title });

    if (!isPending && !error) {
      toast.success("Document updated successfully");
      navigate(`/documents/${id}`);
    } else if (error) {
      toast.error(error || "Failed to update document");
    }
  };

  if (isLoading && !currentDocument) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
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
          >
            {/* Back to Document */}
          </Button>
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

              {currentDocument && (
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
                        {currentDocument.originalFileName}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        File Type:
                      </span>
                      <p className="text-gray-900 dark:text-white truncate">
                        {currentDocument.fileType}
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
              isLoading={isLoading}
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
