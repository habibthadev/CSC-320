import multer from "multer";
import Document from "../models/document.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";
import {
  processFile,
  saveFileToDisk,
  cleanupTempFiles,
} from "../utils/file-processing.js";
import { chunkText, generateEmbedding } from "../services/vector.service.js";
import { summarizeDocument } from "../services/ai.service.js";
import { NODE_ENV, MAX_FILE_SIZE } from "../config/env.js";

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/bmp",
      "image/tiff",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Unsupported file type", 400), false);
    }
  },
});

export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError("No files uploaded", 400);
  }

  if (req.files.length > 5) {
    throw new AppError("Maximum 5 files allowed per upload", 400);
  }

  const results = [];
  const errors = [];

  for (const file of req.files) {
    try {
      if (file.size === 0) {
        errors.push({
          filename: file.originalname,
          error: "File is empty",
        });
        continue;
      }

      const extractedText = await processFile(file);

      if (!extractedText || extractedText.trim().length === 0) {
        errors.push({
          filename: file.originalname,
          error: "No text could be extracted from file",
        });
        continue;
      }

      const fileInfo = await saveFileToDisk(file, req.user._id);

      const summary = await summarizeDocument(extractedText, 150);

      const document = await Document.create({
        user: req.user._id,
        title: req.body.title || file.originalname,
        originalFileName: fileInfo.originalFileName,
        fileType: fileInfo.fileType,
        fileSize: fileInfo.fileSize,
        storagePath: fileInfo.storagePath,
        extractedText,
        summary,
        wordCount: extractedText.split(/\s+/).length,
      });

      results.push({
        _id: document._id,
        title: document.title,
        fileType: document.fileType,
        fileSize: document.fileSize,
        originalFileName: document.originalFileName,
        summary: document.summary,
        wordCount: document.wordCount,
        createdAt: document.createdAt,
      });
    } catch (error) {
      console.error(`Error processing file ${file.originalname}:`, error);
      errors.push({
        filename: file.originalname,
        error: error.message,
      });
    }
  }

  if (NODE_ENV === "production") {
    cleanupTempFiles();
  }

  res.status(201).json({
    success: true,
    count: results.length,
    data: results,
    errors: errors.length > 0 ? errors : undefined,
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

  if (!document.extractedText || document.extractedText.trim().length === 0) {
    throw new AppError("Document has no content to vectorize", 400);
  }

  try {
    const textChunks = chunkText(document.extractedText);

    if (textChunks.length === 0) {
      throw new AppError("No valid text chunks found for vectorization", 400);
    }

    document.vectorized = true;
    document.chunkCount = textChunks.length;
    await document.save();

    res.json({
      success: true,
      message: "Document vectorized successfully",
      docId: document._id,
      chunkCount: textChunks.length,
    });
  } catch (error) {
    console.error("Vectorization error:", error);
    throw new AppError("Failed to vectorize document", 500);
  }
});

export const getDocuments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

  const documents = await Document.find({ user: req.user._id })
    .select("-extractedText")
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Document.countDocuments({ user: req.user._id });

  res.json({
    success: true,
    count: documents.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: documents,
  });
});

export const getDocumentById = asyncHandler(async (req, res) => {
  const includeText = req.query.includeText === "true";

  const selectFields = includeText ? {} : { extractedText: 0 };

  const document = await Document.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .select(selectFields)
    .lean();

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

  if (!title || title.trim().length === 0) {
    throw new AppError("Title is required and cannot be empty", 400);
  }

  if (title.length > 200) {
    throw new AppError(
      "Title is too long. Maximum 200 characters allowed",
      400
    );
  }

  const document = await Document.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  document.title = title.trim();
  document.updatedAt = new Date();
  await document.save();

  res.json({
    success: true,
    message: "Document updated successfully",
    data: {
      _id: document._id,
      title: document.title,
      updatedAt: document.updatedAt,
    },
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
    message: "Document deleted successfully",
  });
});

export const bulkDeleteDocuments = asyncHandler(async (req, res) => {
  const { documentIds } = req.body;

  if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
    throw new AppError("Document IDs are required", 400);
  }

  const result = await Document.deleteMany({
    _id: { $in: documentIds },
    user: req.user._id,
  });

  res.json({
    success: true,
    message: `${result.deletedCount} documents deleted successfully`,
    deletedCount: result.deletedCount,
  });
});

export const searchDocuments = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!query || query.trim().length === 0) {
    throw new AppError("Search query is required", 400);
  }

  const searchRegex = new RegExp(query.trim(), "i");

  const documents = await Document.find({
    user: req.user._id,
    $or: [
      { title: searchRegex },
      { originalFileName: searchRegex },
      { summary: searchRegex },
    ],
  })
    .select("-extractedText")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Document.countDocuments({
    user: req.user._id,
    $or: [
      { title: searchRegex },
      { originalFileName: searchRegex },
      { summary: searchRegex },
    ],
  });

  res.json({
    success: true,
    query: query.trim(),
    count: documents.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: documents,
  });
});

export const getDocumentStats = asyncHandler(async (req, res) => {
  const stats = await Document.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: null,
        totalDocuments: { $sum: 1 },
        totalSize: { $sum: "$fileSize" },
        totalWords: { $sum: "$wordCount" },
        vectorizedCount: {
          $sum: { $cond: [{ $eq: ["$vectorized", true] }, 1, 0] },
        },
        fileTypes: { $push: "$fileType" },
      },
    },
  ]);

  const fileTypeStats = {};
  if (stats.length > 0) {
    stats[0].fileTypes.forEach((type) => {
      fileTypeStats[type] = (fileTypeStats[type] || 0) + 1;
    });
  }

  res.json({
    success: true,
    data: {
      totalDocuments: stats[0]?.totalDocuments || 0,
      totalSize: stats[0]?.totalSize || 0,
      totalWords: stats[0]?.totalWords || 0,
      vectorizedCount: stats[0]?.vectorizedCount || 0,
      fileTypeStats,
    },
  });
});
