import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Edit,
  Trash2,
  MessageSquare,
  Database,
  Download,
  Sparkles,
  Eye,
  Calendar,
  File,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/Tabs";
import { Spinner } from "../../components/ui/Spinner";
import { Alert } from "../../components/ui/Alert";
import {
  useDocument,
  useDeleteDocument,
  useVectorizeDocument,
} from "../../hooks/useDocuments";
import { useQuestionsByDocument } from "../../hooks/useQuestions";
import { formatFileSize, formatDate, getFileIcon } from "../../utils/fileUtils";
import { fadeIn } from "../../utils/animations";

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const contentRef = useRef(null);

  const { data: document, isLoading, error, isFetching } = useDocument(id);
  const { data: questions = [], isLoading: questionsLoading } =
    useQuestionsByDocument(id);
  const deleteDocumentMutation = useDeleteDocument();
  const vectorizeDocumentMutation = useVectorizeDocument();

  useEffect(() => {
    console.log("DocumentDetail - State:", {
      document,
      isLoading,
      isFetching,
      error,
      id,
    });
  }, [document, isLoading, isFetching, error, id]);

  useEffect(() => {
    if (document && contentRef.current) {
      fadeIn(contentRef.current, 0.2);
    }
  }, [document, activeTab]);

  const handleDelete = () => {
    deleteDocumentMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Document deleted successfully");
        navigate("/documents");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete document");
        setShowDeleteModal(false);
      },
    });
  };

  const handleVectorize = () => {
    vectorizeDocumentMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Document vectorized successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to vectorize document");
      },
    });
  };

  if (isLoading && !document) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner className="h-8 w-8" />
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Document Not Found
            </h1>
            <p className="text-muted-foreground">
              The document you're looking for doesn't exist or has been deleted.
            </p>
          </div>
          <Button asChild>
            <Link to="/documents">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documents
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const renderDocumentIcon = (fileType) => {
    const iconName = getFileIcon(fileType);
    const IconComponent =
      {
        "file-text": FileText,
        file: FileText,
        image: FileText,
      }[iconName] || FileText;

    return <IconComponent className="h-6 w-6" />;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link
        to="/documents"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Documents
      </Link>

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {document.title}
          </h1>
          <p className="text-muted-foreground">{document.originalFileName}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
          <Button variant="outline" asChild className="h-11 font-medium px-4">
            <Link
              to={`/documents/edit/${id}`}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-card border border-border hover:bg-accent text-foreground transition-colors rounded-md"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            className="h-11 font-medium px-4 flex items-center justify-center gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>

          <Button asChild className="h-11 font-medium px-4">
            <Link
              to={`/chat/${id}`}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white border-0 transition-colors rounded-md"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Link>
          </Button>

          <Button variant="secondary" asChild className="h-11 font-medium px-4">
            <Link
              to={`/generate/${id}`}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border transition-colors rounded-md"
            >
              <Sparkles className="h-4 w-4" />
              Generate Exam
            </Link>
          </Button>

          {!document.vectorized && (
            <Button
              variant="outline"
              onClick={handleVectorize}
              isLoading={vectorizeDocumentMutation.isPending}
              className="h-11 font-medium px-4 flex items-center justify-center gap-2 sm:col-span-2 lg:col-span-1 border-info-200 text-info-700 hover:bg-info-50 hover:border-info-300 rounded-md"
            >
              <Database className="h-4 w-4" />
              Vectorize
            </Button>
          )}
        </div>

        <Tabs
          defaultValue="details"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Document Details
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content Preview
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Questions
              {questions.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 text-xs">
                  {questions.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" ref={contentRef}>
            <Card>
              <CardHeader>
                <CardTitle>Document Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-orange-100">
                    {renderDocumentIcon(document.fileType)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold">{document.title}</h3>
                    <p className="text-muted-foreground">
                      {document.originalFileName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      File Type
                    </h4>
                    <p className="font-medium">
                      {document.fileType.toUpperCase()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      File Size
                    </h4>
                    <p className="font-medium">
                      {formatFileSize(document.fileSize)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Upload Date
                    </h4>
                    <p className="font-medium">
                      {formatDate(document.createdAt)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Processing Status
                    </h4>
                    <div>
                      {document.vectorized ? (
                        <Badge
                          variant="default"
                          className="bg-success-100 text-success-800"
                        >
                          <Database className="h-3 w-3 mr-1" />
                          Ready for Chat
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Calendar className="h-3 w-3 mr-1" />
                          Processing Required
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Original File
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {document.extractedText || "No content available"}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Generated Questions</CardTitle>
                <Button
                  variant="secondary"
                  asChild
                  className="h-11 font-medium px-4"
                >
                  <Link
                    to={`/generate/${id}`}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border transition-colors rounded-md"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate Exam
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {questionsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Spinner size="lg" />
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">No questions generated</h3>
                      <p className="text-muted-foreground">
                        Generate questions from this document to create exams
                        and quizzes.
                      </p>
                    </div>
                    <Button asChild>
                      <Link to={`/generate/${id}`}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Questions
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.slice(0, 5).map((question, index) => (
                      <div
                        key={question._id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-3">
                          <h3 className="font-medium">
                            {index + 1}. {question.question}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant={
                                question.difficulty === "easy"
                                  ? "default"
                                  : question.difficulty === "medium"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {question.difficulty}
                            </Badge>
                            {question.tags &&
                              question.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    {questions.length > 5 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" asChild>
                          <Link to={`/generate/${id}`}>
                            View All Questions ({questions.length})
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Document"
          description="This action cannot be undone."
        >
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete "{document.title}"?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                isLoading={deleteDocumentMutation.isPending}
              >
                Delete Document
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default DocumentDetail;
