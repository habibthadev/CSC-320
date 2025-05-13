import Document from "../models/documentModel.js";
import { asyncHandler, AppError } from "../middleware/errorMiddleware.js";
import { chunkText, findRelevantChunks } from "../services/vectorService.js";
import { generateRagResponse } from "../services/aiService.js";

export const chatWithDocument = asyncHandler(async (req, res) => {
  const { query } = req.body;
  const documentId = req.params.documentId;

  if (!query) {
    throw new AppError("Query is required", 400);
  }

  const document = await Document.findOne({
    _id: documentId,
    user: req.user._id,
  });

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  const textChunks = chunkText(document.extractedText);

  const relevantChunks = await findRelevantChunks(query, textChunks);

  const context = relevantChunks.map((item) => item.chunk).join("\n\n");

  const response = await generateRagResponse(query, context);

  res.json({
    success: true,
    data: {
      query,
      response,
    },
  });
});

export const chatWithMultipleDocuments = asyncHandler(async (req, res) => {
  const { query, documentIds } = req.body;

  if (!query) {
    throw new AppError("Query is required", 400);
  }

  if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
    throw new AppError("Document IDs are required", 400);
  }

  const documents = await Document.find({
    _id: { $in: documentIds },
    user: req.user._id,
  });

  if (documents.length === 0) {
    throw new AppError("No valid documents found", 404);
  }

  let allChunks = [];
  for (const doc of documents) {
    const chunks = chunkText(doc.extractedText);
    allChunks = [...allChunks, ...chunks];
  }

  const relevantChunks = await findRelevantChunks(query, allChunks);

  const context = relevantChunks.map((item) => item.chunk).join("\n\n");

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
