import Document from "../models/documentModel.js";
import { asyncHandler, AppError } from "../middleware/errorMiddleware.js";
import { chunkText, findRelevantChunks } from "../services/vectorService.js";
import { generateRagResponse } from "../services/aiService.js";

// @desc    Chat with document
// @route   POST /api/rag/chat/:documentId
// @access  Private
export const chatWithDocument = asyncHandler(async (req, res) => {
  const { query } = req.body;
  const documentId = req.params.documentId;

  if (!query) {
    throw new AppError("Query is required", 400);
  }

  // Find document
  const document = await Document.findOne({
    _id: documentId,
    user: req.user._id,
  });

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  // Chunk the document text
  const textChunks = chunkText(document.extractedText);

  // Find relevant chunks for the query
  const relevantChunks = await findRelevantChunks(query, textChunks);

  // Combine relevant chunks into context
  const context = relevantChunks.map((item) => item.chunk).join("\n\n");

  // Generate RAG response
  const response = await generateRagResponse(query, context);

  res.json({
    success: true,
    data: {
      query,
      response,
    },
  });
});

// @desc    Chat with multiple documents
// @route   POST /api/rag/chat
// @access  Private
export const chatWithMultipleDocuments = asyncHandler(async (req, res) => {
  const { query, documentIds } = req.body;

  if (!query) {
    throw new AppError("Query is required", 400);
  }

  if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
    throw new AppError("Document IDs are required", 400);
  }

  // Find documents owned by the user
  const documents = await Document.find({
    _id: { $in: documentIds },
    user: req.user._id,
  });

  if (documents.length === 0) {
    throw new AppError("No valid documents found", 404);
  }

  // Collect all document content
  let allChunks = [];
  for (const doc of documents) {
    const chunks = chunkText(doc.extractedText);
    allChunks = [...allChunks, ...chunks];
  }

  // Find relevant chunks across all documents
  const relevantChunks = await findRelevantChunks(query, allChunks);

  // Combine relevant chunks into context
  const context = relevantChunks.map((item) => item.chunk).join("\n\n");

  // Generate RAG response
  const response = await generateRagResponse(query, context);

  res.json({
    success: true,
    data: {
      query,
      response,
      documentsUsed: documents.map((doc) => ({
        _id: doc._id,
        title: doc.title,
      })),
    },
  });
});
