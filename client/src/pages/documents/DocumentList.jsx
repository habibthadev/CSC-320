import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  FileText,
  Trash2,
  Edit,
  MoreVertical,
  Upload,
  Database,
  Eye,
  MessageSquare,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Spinner } from "../../components/ui/Spinner";
import { Alert } from "../../components/ui/Alert";
import {
  useDocuments,
  useDeleteDocument,
  useVectorizeDocument,
} from "../../hooks/useDocuments";
import { formatFileSize, formatDate, getFileIcon } from "../../utils/fileUtils";

const DocumentList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const documentsRef = useRef(null);

  const { data: documents = [], isLoading, error } = useDocuments();
  const deleteMutation = useDeleteDocument();
  const vectorizeMutation = useVectorizeDocument();

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.originalFileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (document) => {
    setDocumentToDelete(document);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    deleteMutation.mutate(documentToDelete._id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        setDocumentToDelete(null);
      },
    });
  };

  const handleVectorize = async (id) => {
    vectorizeMutation.mutate(id);
  };

  const renderDocumentIcon = (fileType) => {
    const iconName = getFileIcon(fileType);
    const IconComponent =
      {
        "file-text": FileText,
        file: FileText,
        image: FileText,
      }[iconName] || FileText;

    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-8 lg:mb-12">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Documents
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage and organize your uploaded documents
            </p>
          </div>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link
              to="/documents/upload"
              className="flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600 shadow-lg hover:shadow-xl transition-all duration-300 rounded-md"
            >
              <Upload className="h-5 w-5 flex-shrink-0" />
              <span>Upload Document</span>
            </Link>
          </Button>
        </div>

        <Card className="mb-6 sm:mb-8 shadow-sm border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl text-card-foreground">
              Search Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                placeholder="Search by title or filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-input focus:border-teal-500 focus:ring-teal-500 bg-background text-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <Alert
            variant="destructive"
            className="mb-6 sm:mb-8 border-destructive/50"
          >
            <FileText className="h-4 w-4" />
            <div>
              <h4 className="font-medium">Error loading documents</h4>
              <p className="text-sm">
                {error.message || "Something went wrong"}
              </p>
            </div>
          </Alert>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12 lg:py-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-lg sm:text-xl font-semibold text-foreground">
              {searchTerm ? "No documents found" : "No documents yet"}
            </h3>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              {searchTerm
                ? "No documents match your search criteria"
                : "Upload your first document to get started"}
            </p>
            {!searchTerm && (
              <Button
                // asChild
                className="mt-6 bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link
                  to="/documents/upload"
                  className="flex items-center gap-2 px-6 py-3 text-base font-semibold bg-transparent"
                >
                  <Upload className="h-4 w-4 flex-shrink-0" />
                  <span>Upload Document</span>
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            ref={documentsRef}
          >
            {filteredDocuments.map((document) => (
              <Card
                key={document._id}
                className="group overflow-hidden transition-all duration-300 border bg-card hover:bg-muted/50 hover:-translate-y-2 hover:scale-[1.02] cursor-pointer"
              >
                <CardContent className="p-0">
                  <div className="p-4 sm:p-6 border-b border-border">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 p-3 rounded-2xl bg-teal-200 dark:bg-teal-900 group-hover:bg-teal-200 dark:group-hover:bg-teal-800 transition-all duration-300">
                        {renderDocumentIcon(document.fileType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-card-foreground truncate text-base sm:text-lg leading-tight">
                          {document.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate mt-1">
                          {document.originalFileName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(document.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="secondary"
                          className="text-xs px-3 py-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                        >
                          {formatFileSize(document.fileSize)}
                        </Badge>
                        {document.vectorized ? (
                          <Badge
                            variant="default"
                            className="text-xs px-3 py-1 bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 border-0 shadow-sm"
                          >
                            <Database className="h-3 w-3 mr-1.5 flex-shrink-0" />
                            <span>Vectorized</span>
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVectorize(document._id)}
                            disabled={vectorizeMutation.isPending}
                            className="h-8 text-xs px-3 border-teal-300 dark:border-teal-600 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 transition-all duration-200"
                          >
                            <Database className="h-3 w-3 mr-1.5 flex-shrink-0" />
                            <span>
                              {vectorizeMutation.isPending
                                ? "Processing..."
                                : "Vectorize"}
                            </span>
                          </Button>
                        )}
                      </div>

                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted hover:scale-110 transition-all duration-200"
                        >
                          <Link
                            to={`/documents/edit/${document._id}`}
                            className="flex items-center justify-center h-full w-full bg-transparent hover:bg-muted rounded-md transition-colors"
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(document)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-110 transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1 h-10 border-input group/btn"
                      >
                        <Link
                          to={`/documents/${document._id}`}
                          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-background hover:bg-muted text-foreground transition-colors w-full h-full duration-200 rounded-md"
                        >
                          <Eye className="h-4 w-4 flex-shrink-0 group-hover/btn:scale-110 transition-transform" />
                          <span>View</span>
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        asChild
                        className="flex-1 h-10 group/btn"
                      >
                        <Link
                          to={`/chat/${document._id}`}
                          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white transition-all duration-300 w-full h-full rounded-md"
                        >
                          <MessageSquare className="h-4 w-4 flex-shrink-0 group-hover/btn:scale-110 transition-transform" />
                          <span>Chat</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Document"
          description="This action cannot be undone."
        >
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete "{documentToDelete?.title}"?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="border-input text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                isLoading={deleteMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
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

export default DocumentList;
