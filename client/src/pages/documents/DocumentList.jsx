import { useEffect, useState, useRef } from "react";
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
} from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import useDocumentStore from "../../stores/documentStore";
import { formatFileSize, formatDate, getFileIcon } from "../../utils/fileUtils";
import { staggerItems } from "../../utils/animations";

const DocumentList = () => {
  const {
    documents,
    fetchDocuments,
    deleteDocument,
    vectorizeDocument,
    isLoading,
  } = useDocumentStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const documentsRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    if (documents.length > 0 && documentsRef.current) {
      const items = documentsRef.current.querySelectorAll(".document-item");
      staggerItems(items, 0.2, 0.05);
    }
  }, [documents]);

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

    const { success, error } = await deleteDocument(documentToDelete._id);

    if (success) {
      toast.success("Document deleted successfully");
    } else {
      toast.error(error || "Failed to delete document");
    }

    setShowDeleteModal(false);
    setDocumentToDelete(null);
  };

  const handleVectorize = async (id) => {
    const { success, error } = await vectorizeDocument(id);

    if (success) {
      toast.success("Document vectorized successfully");
    } else {
      toast.error(error || "Failed to vectorize document");
    }
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Documents
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your uploaded documents
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button to="/documents/upload" icon={Upload}>
            Upload Document
          </Button>
          <Button to="/chat" variant="secondary" icon={Plus}>
            New Chat
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by title or filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-800">
            <FileText className="h-8 w-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No documents found
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {searchTerm
              ? "No documents match your search criteria"
              : "Upload your first document to get started"}
          </p>
          {!searchTerm && (
            <Button to="/documents/upload" className="mt-4" icon={Upload}>
              Upload Document
            </Button>
          )}
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          ref={documentsRef}
        >
          {filteredDocuments.map((document) => (
            <Card
              key={document._id}
              className="document-item overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
                      {renderDocumentIcon(document.fileType)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white truncate max-w-[180px]">
                        {document.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                        {document.originalFileName}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                      <MoreVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10 hidden group-hover:block">
                      <Link
                        to={`/documents/${document._id}`}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        View Details
                      </Link>
                      <Link
                        to={`/documents/edit/${document._id}`}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(document)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary" size="sm">
                    {formatFileSize(document.fileSize)}
                  </Badge>
                  {document.vectorized ? (
                    <Badge variant="success" size="sm">
                      Vectorized
                    </Badge>
                  ) : (
                    <button
                      onClick={() => handleVectorize(document._id)}
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      <Database className="h-3 w-3 mr-1" />
                      Vectorize
                    </button>
                  )}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(document.createdAt)}
                  </p>
                  <div className="flex space-x-1">
                    <Link to={`/documents/edit/${document._id}`}>
                      <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(document)}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Trash2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900">
                <div className="flex justify-between">
                  <Link
                    to={`/documents/${document._id}`}
                    className="text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 text-sm font-medium"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/chat/${document._id}`}
                    className="text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 text-sm font-medium"
                  >
                    Chat with Document
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Document"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete "{documentToDelete?.title}"? This
            action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DocumentList;
