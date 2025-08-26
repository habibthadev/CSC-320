import Document from "../models/document.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";
import {
  chunkText,
  findRelevantChunks,
  findRelevantContent,
} from "../services/vector.service.js";
import {
  generateRagResponse,
  generateChatResponse,
} from "../services/ai.service.js";
import { cleanupTempFiles } from "../utils/file-processing.js";
import { NODE_ENV } from "../config/env.js";

export const chatWithDocument = asyncHandler(async (req, res) => {
  const { query, conversationHistory = [] } = req.body;
  const documentId = req.params.documentId;

  if (!query || query.trim().length === 0) {
    throw new AppError("Query is required and cannot be empty", 400);
  }

  const document = await Document.findOne({
    _id: documentId,
    user: req.user._id,
  }).lean();

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  if (!document.extractedText || document.extractedText.trim().length === 0) {
    throw new AppError("Document has no extractable text content", 400);
  }

  try {
    const documents = [
      {
        _id: document._id,
        title: document.title,
        content: document.extractedText,
      },
    ];

    const relevantContent = await findRelevantContent(query, documents, {
      topK: 4,
      similarityThreshold: 0.4,
      chunkSize: 800,
      chunkStrategy: "sentence",
    });

    if (relevantContent.length === 0) {
      res.json({
        success: true,
        data: {
          query,
          response:
            "I couldn't find relevant information in this document to answer your question.",
          documentTitle: document.title,
          chunksUsed: 0,
          sources: [],
        },
      });
      return;
    }

    const contextWithSources = relevantContent.map((item, index) => ({
      content: item.content,
      source: `[Source ${index + 1} from "${document.title}"]`,
      similarity: item.similarity,
      startIndex: item.startIndex || 0,
      endIndex: item.endIndex || item.content.length,
    }));

    const context = contextWithSources
      .map((item) => `${item.source}: ${item.content}`)
      .join("\n\n");

    const response = await generateRagResponse(
      query,
      context,
      conversationHistory
    );

    if (NODE_ENV === "production") {
      cleanupTempFiles();
    }

    res.json({
      success: true,
      data: {
        query,
        response,
        documentTitle: document.title,
        chunksUsed: relevantContent.length,
        avgSimilarity:
          relevantContent.reduce((sum, item) => sum + item.similarity, 0) /
          relevantContent.length,
        sources: contextWithSources.map((item, index) => ({
          id: index + 1,
          title: document.title,
          content:
            item.content.substring(0, 200) +
            (item.content.length > 200 ? "..." : ""),
          similarity: item.similarity,
          startIndex: item.startIndex,
          endIndex: item.endIndex,
        })),
      },
    });
  } catch (error) {
    console.error("RAG processing error:", error);
    throw new AppError("Failed to process document query", 500);
  }
});

export const chatWithMultipleDocuments = asyncHandler(async (req, res) => {
  const { query, documentIds, conversationHistory = [] } = req.body;

  if (!query || query.trim().length === 0) {
    throw new AppError("Query is required and cannot be empty", 400);
  }

  if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
    throw new AppError("Document IDs are required", 400);
  }

  if (documentIds.length > 10) {
    throw new AppError("Maximum 10 documents allowed per query", 400);
  }

  const documents = await Document.find({
    _id: { $in: documentIds },
    user: req.user._id,
  }).lean();

  if (documents.length === 0) {
    throw new AppError("No valid documents found", 404);
  }

  try {
    const validDocuments = documents.filter(
      (doc) => doc.extractedText && doc.extractedText.trim().length > 0
    );

    if (validDocuments.length === 0) {
      throw new AppError("No documents contain extractable text", 400);
    }

    const documentData = validDocuments.map((doc) => ({
      _id: doc._id,
      title: doc.title,
      content: doc.extractedText,
      metadata: {
        uploadDate: doc.uploadDate,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
      },
    }));

    const relevantContent = await findRelevantContent(query, documentData, {
      topK: 6,
      similarityThreshold: 0.3,
      chunkSize: 800,
      chunkStrategy: "sentence",
    });

    if (relevantContent.length === 0) {
      res.json({
        success: true,
        data: {
          query,
          response:
            "I couldn't find relevant information in the provided documents to answer your question.",
          documentsUsed: validDocuments.map((doc) => ({
            _id: doc._id,
            title: doc.title,
          })),
          chunksUsed: 0,
        },
      });
      return;
    }

    const context = relevantContent
      .map((item) => `[From "${item.documentTitle}"]: ${item.content}`)
      .join("\n\n");

    const response = await generateRagResponse(
      query,
      context,
      conversationHistory
    );

    if (NODE_ENV === "production") {
      cleanupTempFiles();
    }

    res.json({
      success: true,
      data: {
        query,
        response,
        documentsUsed: validDocuments.map((doc) => ({
          _id: doc._id,
          title: doc.title,
        })),
        chunksUsed: relevantContent.length,
        avgSimilarity:
          relevantContent.reduce((sum, item) => sum + item.similarity, 0) /
          relevantContent.length,
        sourceBreakdown: relevantContent.reduce((acc, item) => {
          acc[item.documentTitle] = (acc[item.documentTitle] || 0) + 1;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("Multi-document RAG error:", error);
    throw new AppError("Failed to process multi-document query", 500);
  }
});

export const generalChat = asyncHandler(async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  if (!message || message.trim().length === 0) {
    throw new AppError("Message is required and cannot be empty", 400);
  }

  if (message.length > 1000) {
    throw new AppError(
      "Message is too long. Maximum 1000 characters allowed",
      400
    );
  }

  try {
    const result = await generateChatResponse(message, conversationHistory);

    if (NODE_ENV === "production") {
      cleanupTempFiles();
    }

    res.json({
      success: true,
      data: {
        message,
        response: result.text,
        timestamp: new Date().toISOString(),
        sources: result.sources || [],
        hasWebSearch: result.hasWebSearch || false,
      },
    });
  } catch (error) {
    console.error("General chat error:", error);
    throw new AppError("Failed to generate chat response", 500);
  }
});
