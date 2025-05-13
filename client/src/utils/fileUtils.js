export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

export const getFileTypeIcon = (filename) => {
  const extension = getFileExtension(filename).toLowerCase();

  switch (extension) {
    case "pdf":
      return "file-pdf";
    case "doc":
    case "docx":
      return "file-text";
    case "xls":
    case "xlsx":
      return "file-spreadsheet";
    case "ppt":
    case "pptx":
      return "file-presentation";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "tiff":
      return "file-image";
    case "txt":
      return "file-text";
    default:
      return "file";
  }
};

export const getFileIcon = (fileType) => {
  if (!fileType) return "file";

  const type = fileType.toLowerCase();

  if (type.includes("pdf")) return "file-text";
  if (type.includes("doc")) return "file-text";
  if (type.includes("xls")) return "file";
  if (type.includes("ppt")) return "file";
  if (
    type.includes("jpg") ||
    type.includes("jpeg") ||
    type.includes("png") ||
    type.includes("gif") ||
    type.includes("bmp")
  )
    return "image";
  if (type.includes("txt")) return "file-text";

  return "file";
};

export const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const validateFileType = (file) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
  ];

  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file) => {
  const maxSize = 20 * 1024 * 1024;
  return file.size <= maxSize;
};

export const isValidFileType = (file, allowedTypes) => {
  if (!allowedTypes || allowedTypes.length === 0) {
    return true;
  }

  const fileType = file.type;
  return allowedTypes.includes(fileType);
};

export const isValidFileSize = (file, maxSizeInBytes) => {
  if (!maxSizeInBytes) {
    return true;
  }

  return file.size <= maxSizeInBytes;
};

export const createFilePreviewUrl = (file) => {
  return URL.createObjectURL(file);
};

export const revokeFilePreviewUrl = (url) => {
  URL.revokeObjectURL(url);
};
