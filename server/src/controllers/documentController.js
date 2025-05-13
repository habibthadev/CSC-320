import multer from "multer";
import Document from "../models/documentModel.js";
import { asyncHandler, AppError } from "../middleware/errorMiddleware.js";
import { processFile, saveFileToDisk } from "../utils/fileProcessing.js";
import { chunkText, generateEmbedding } from "../services/vectorService.js";

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError("No files uploaded", 400);
  }

  const results = [];

  for (const file of req.files) {
    const extractedText = await processFile(file);

    const fileInfo = await saveFileToDisk(file, req.user._id);

    const document = await Document.create({
      user: req.user._id,
      title: req.body.title || file.originalname,
      originalFileName: fileInfo.originalFileName,
      fileType: fileInfo.fileType,
      fileSize: fileInfo.fileSize,
      storagePath: fileInfo.storagePath,
      extractedText,
    });

    results.push({
      _id: document._id,
      title: document.title,
      fileType: document.fileType,
      fileSize: document.fileSize,
      originalFileName: document.originalFileName,
      createdAt: document.createdAt,
    });
  }

  res.status(201).json({
    success: true,
    count: results.length,
    data: results,
  });
});

export const vectorizeDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  if (document.vectorized) {
    throw new AppError("Document is already vectorized", 400);
  }

  const textChunks = chunkText(document.extractedText);

  document.vectorized = true;
  await document.save();

  res.json({
    success: true,
    message: "Document vectorized successfully",
    docId: document._id,
  });
});

export const getDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find({ user: req.user._id })
    .select("-extractedText")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: documents.length,
    data: documents,
  });
});

export const getDocumentById = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  res.json({
    success: true,
    data: document,
  });
});

export const updateDocument = asyncHandler(async (req, res) => {
  const { title } = req.body;

  const document = await Document.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  document.title = title || document.title;
  await document.save();

  res.json({
    success: true,
    data: document,
  });
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  await document.deleteOne();

  res.json({
    success: true,
    message: "Document deleted",
  });
});

export const searchDocuments = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    throw new AppError("Search query is required", 400);
  }

  const documents = await Document.find({
    user: req.user._id,
    $text: { $search: query },
  })
    .select("-extractedText")
    .sort({ score: { $meta: "textScore" } });

  res.json({
    success: true,
    count: documents.length,
    data: documents,
  });
});
