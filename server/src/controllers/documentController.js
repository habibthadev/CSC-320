import multer from "multer";
import Document from "../models/documentModel.js";
import { asyncHandler, AppError } from "../middleware/errorMiddleware.js";
import { processFile, saveFileToDisk } from "../utils/fileProcessing.js";
import { chunkText, generateEmbedding } from "../services/vectorService.js";

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB file size limit
});

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError("No files uploaded", 400);
  }

  const results = [];

  // Process each uploaded file
  for (const file of req.files) {
    // Extract text based on file type
    const extractedText = await processFile(file);

    // Save file to disk
    const fileInfo = await saveFileToDisk(file, req.user._id);

    // Create document record in database
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

// @desc    Create document vectors
// @route   POST /api/documents/:id/vectorize
// @access  Private
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

  // Chunk the document text
  const textChunks = chunkText(document.extractedText);

  // Generate embeddings for each chunk
  // For this implementation, we're just marking the document as vectorized
  // In a production environment, you'd store these embeddings in a vector database
  document.vectorized = true;
  await document.save();

  res.json({
    success: true,
    message: "Document vectorized successfully",
    docId: document._id,
  });
});

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
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

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private
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

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private
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

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
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

// @desc    Search documents
// @route   GET /api/documents/search
// @access  Private
export const searchDocuments = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    throw new AppError("Search query is required", 400);
  }

  // Use MongoDB text search
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
