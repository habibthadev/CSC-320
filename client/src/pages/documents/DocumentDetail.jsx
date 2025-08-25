import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Edit,
  Trash2,
  MessageSquare,
  Database,
  Download,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "../../components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { Tabs, TabsTrigger, TabsContent } from "../../components/ui/Tabs";
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

  const { data: document, isLoading, error } = useDocument(id);
  const { data: questions = [], isLoading: questionsLoading } =
    useQuestionsByDocument(id);
  const deleteDocumentMutation = useDeleteDocument();
  const vectorizeDocumentMutation = useVectorizeDocument();

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
            The document you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate("/documents")}>
            Back to Documents
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/documents")}
            icon={ArrowLeft}
            className="mr-4 flex-shrink-0"
          ></Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white truncate">
            {document.title}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Button to={`/documents/${id}/edit`} variant="outline" icon={Edit}>
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            icon={Trash2}
          >
            Delete
          </Button>
          <Button to={`/chat/${id}`} icon={MessageSquare}>
            Chat with Document
          </Button>
          <Button to={`/generate/${id}`} icon={Sparkles}>
            Generate Exam
          </Button>
          {!document.vectorized && (
            <Button
              variant="secondary"
              onClick={handleVectorize}
              icon={Database}
              isLoading={vectorizeDocumentMutation.isPending}
            >
              Vectorize
            </Button>
          )}
        </div>

        <Tabs
          defaultValue="details"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <div className="border-b border-gray-200 dark:border-gray-800">
            <div className="flex overflow-x-auto">
              <TabsTrigger value="details">Document Details</TabsTrigger>
              <TabsTrigger value="content">Content Preview</TabsTrigger>
              <TabsTrigger value="questions">
                Questions
                {questions.length > 0 && (
                  <Badge variant="primary" size="sm" className="ml-2">
                    {questions.length}
                  </Badge>
                )}
              </TabsTrigger>
            </div>
          </div>

          <TabsContent value="details" ref={contentRef}>
            <Card>
              <CardHeader>
                <CardTitle>Document Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                    {renderDocumentIcon(document.fileType)}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                      {document.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {document.originalFileName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      File Type
                    </h4>
                    <p className="text-gray-900 dark:text-white truncate">
                      {document.fileType}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      File Size
                    </h4>
                    <p className="text-gray-900 dark:text-white">
                      {formatFileSize(document.fileSize)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Upload Date
                    </h4>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(document.createdAt)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </h4>
                    <div className="mt-1">
                      {document.vectorized ? (
                        <Badge variant="success">Vectorized</Badge>
                      ) : (
                        <Badge variant="warning">Not Vectorized</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" icon={Download}>
                  Download Original File
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="content" ref={contentRef}>
            <Card>
              <CardHeader>
                <CardTitle>Content Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200">
                    {document.extractedText || "No content available"}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" ref={contentRef}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Generated Questions</CardTitle>
                <Button to={`/generate/${id}`} size="sm" icon={Sparkles}>
                  Generate Exam
                </Button>
              </CardHeader>
              <CardContent>
                {questionsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No questions have been generated for this document yet.
                    </p>
                    <Button
                      to={`/generate/${id}`}
                      className="mt-4"
                      icon={Sparkles}
                    >
                      Generate Exam
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.slice(0, 5).map((question, index) => (
                      <div
                        key={question._id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {index + 1}. {question.question}
                            </h3>
                            <div className="mt-2 flex items-center space-x-2">
                              <Badge
                                variant={
                                  question.difficulty === "easy"
                                    ? "success"
                                    : question.difficulty === "medium"
                                    ? "warning"
                                    : "danger"
                                }
                              >
                                {question.difficulty}
                              </Badge>
                              {question.tags &&
                                question.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary">
                                    {tag}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {questions.length > 5 && (
                      <div className="text-center mt-4">
                        <Button to={`/generate/${id}`} variant="outline">
                          Generate New Exam
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
        >
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete "{document.title}"? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={deleteDocumentMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default DocumentDetail;
