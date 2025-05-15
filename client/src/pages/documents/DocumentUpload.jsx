import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  X,
  FileText,
  ImageIcon,
  File,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/Card";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/Alert";
import useDocumentStore from "../../stores/documentStore";
import {
  validateFileType,
  validateFileSize,
  formatFileSize,
} from "../../utils/fileUtils";
import { fadeIn } from "../../utils/animations";

const DocumentUpload = () => {
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const { uploadDocument, isLoading } = useDocumentStore();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  useEffect(() => {
    if (dropZoneRef.current) {
      fadeIn(dropZoneRef.current, 0.2);
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    validateAndAddFiles(selectedFiles);
  };

  const validateAndAddFiles = (selectedFiles) => {
    const validFiles = [];
    const errorMessages = [];

    selectedFiles.forEach((file) => {
      if (!validateFileType(file)) {
        errorMessages.push(`${file.name}: Unsupported file type`);
      } else if (!validateFileSize(file)) {
        errorMessages.push(`${file.name}: File size exceeds 20MB limit`);
      } else {
        validFiles.push(file);
      }
    });

    if (errorMessages.length > 0) {
      toast.error(errorMessages.join("\n"));
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      validateAndAddFiles(droppedFiles);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file) => {
    if (
      file.type.includes("pdf") ||
      file.type.includes("word") ||
      file.type.includes("document")
    ) {
      return <FileText className="h-6 w-6 text-orange-500" />;
    } else if (file.type.includes("image")) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const validate = () => {
    const newErrors = {};

    if (files.length === 0) {
      newErrors.files = "Please select at least one file";
    }

    if (!title.trim() && files.length > 1) {
      newErrors.title = "Title is required when uploading multiple files";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    if (title.trim()) {
      formData.append("title", title);
    }

    const { success, error } = await uploadDocument(formData);

    if (success) {
      toast.success("Document uploaded successfully");
      navigate("/documents");
    } else if (error) {
      toast.error(error || "Failed to upload document");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Upload Document
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>
              Upload PDF, Word documents, text files, or images for processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a title for your document"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={errors.title}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  If left blank, the original filename will be used as the title
                </p>
              </div>

              <div className="space-y-2">
                <Label>Files</Label>
                <div
                  ref={dropZoneRef}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-300 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500"
                  } ${errors.files ? "border-red-500" : ""}`}
                  onClick={() => fileInputRef.current.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Supports PDF, DOCX, TXT, PNG, JPG, JPEG, BMP, TIFF (Max
                      20MB)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.bmp,.tiff"
                  />
                </div>
                {errors.files && (
                  <p className="text-sm text-red-500">{errors.files}</p>
                )}
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Selected Files ({files.length})
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto p-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file)}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                              {file.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 rounded-full text-gray-500 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Alert variant="info">
                <AlertTitle>Processing Information</AlertTitle>
                <AlertDescription>
                  Documents will be processed to extract text. For images, OCR
                  will be used to recognize text content.
                </AlertDescription>
              </Alert>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/documents")}>
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              isLoading={isLoading}
              icon={Upload}
            >
              Upload {files.length > 0 ? `(${files.length})` : ""}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DocumentUpload;
