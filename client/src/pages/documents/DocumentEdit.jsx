import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, FileText, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { useDocument, useUpdateDocument } from "../../hooks/useDocuments";
import { fadeIn } from "../../utils/animations";
import { cn } from "../../utils";

const DocumentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: document, isLoading, error } = useDocument(id);
  const updateDocumentMutation = useUpdateDocument();
  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState({});
  const [isNavigating, setIsNavigating] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setIsNavigating(true);

      const updatedDocument = await updateDocumentMutation.mutateAsync({
        id,
        data: { title },
      });

      navigate(`/documents/${id}`, { replace: true });
    } catch (error) {
      setIsNavigating(false);
      console.error("Update error:", error);
    }
  };

  if (isLoading || isNavigating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner className="h-8 w-8" />
          <p className="text-muted-foreground">
            {isNavigating ? "Saving changes..." : "Loading document..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-background px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="rounded-full bg-destructive/10 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Document Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The document you're trying to edit doesn't exist or has been
            deleted.
          </p>
          <Button onClick={() => navigate("/documents")} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/documents/${id}`)}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Edit Document</h1>
            <p className="text-muted-foreground mt-1">
              Update your document information
            </p>
          </div>
        </div>

        <Card ref={formRef} className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isNavigating && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <div className="flex items-center gap-2 text-green-800">
                  <Spinner className="h-4 w-4" />
                  <span>Document saved successfully! Redirecting...</span>
                </div>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Document Title
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter document title"
                  className={cn(errors.title && "border-destructive")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              <div className="rounded-lg border bg-muted p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Document Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Original Filename
                    </p>
                    <p className="text-sm font-medium break-all">
                      {document.originalFileName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">File Type</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {document.fileType}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Upload Date</p>
                    <p className="text-sm font-medium">
                      {new Date(document.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Last Modified
                    </p>
                    <p className="text-sm font-medium">
                      {new Date(document.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => navigate(`/documents/${id}`)}
              disabled={updateDocumentMutation.isPending || isNavigating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updateDocumentMutation.isPending || isNavigating}
              className="min-w-[120px]"
            >
              {updateDocumentMutation.isPending || isNavigating ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  {isNavigating ? "Redirecting..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DocumentEdit;
