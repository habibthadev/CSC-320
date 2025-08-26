import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Upload,
  X,
  FileText,
  ImageIcon,
  File,
  AlertCircle,
  ArrowLeft,
  Info,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";
import { useUploadDocuments } from "../../hooks/useDocuments";
import {
  validateFileType,
  validateFileSize,
  formatFileSize,
} from "../../utils/fileUtils";

const DocumentUpload = () => {
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const uploadMutation = useUploadDocuments();

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
      setErrors({ files: errorMessages.join("\n") });
    } else {
      setErrors({});
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
      return <FileText className="h-6 w-6 text-teal-500" />;
    } else if (file.type.includes("image")) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />;
    } else {
      return <File className="h-6 w-6 text-gray-400" />;
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

    uploadMutation.mutate(formData, {
      onSuccess: () => {
        navigate("/documents");
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        to="/documents"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Documents
      </Link>

      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Upload Document</h1>
          <p className="text-muted-foreground">
            Upload files for processing and analysis
          </p>
        </div>

        <Card className="border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Document Upload</CardTitle>
            <CardDescription className="text-muted-foreground">
              Upload PDF, Word documents, text files, or images. Each file will
              be processed to extract text content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">Document Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="Enter a title for your document"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={errors.title}
                  className="border-input bg-background text-foreground focus:border-teal-500 focus:ring-teal-500"
                />
                <p className="text-sm text-muted-foreground">
                  If left blank, the original filename will be used as the title
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Files</Label>
                <div
                  ref={dropZoneRef}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                      : "border-input hover:border-teal-500"
                  } ${errors.files ? "border-red-500" : ""}`}
                  onClick={() => fileInputRef.current.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-foreground">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
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
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.files}</p>
                )}
              </div>

              {files.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">
                    Selected Files ({files.length})
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          {getFileIcon(file)}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate text-foreground">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Processing Information</h4>
                  <p className="text-sm mt-1 text-blue-800 dark:text-blue-200">
                    Documents will be processed to extract text. For images, OCR
                    will be used to recognize text content.
                  </p>
                </div>
              </Alert>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild className="border-input text-foreground hover:bg-muted">
              <Link to="/documents">Cancel</Link>
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              isLoading={uploadMutation.isPending}
              disabled={files.length === 0}
              className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload {files.length > 0 ? `(${files.length})` : ""}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DocumentUpload;
