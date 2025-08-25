import { embed, embedMany } from "ai";
import { google } from "@ai-sdk/google";
import { AppError } from "../middleware/error.middleware.js";
import { GOOGLE_GENERATIVE_AI_API_KEY } from "../config/env.js";

const embeddingModel = google.textEmbeddingModel("text-embedding-004", {
  apiKey: GOOGLE_GENERATIVE_AI_API_KEY,
});

export const generateEmbedding = async (text) => {
  try {
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      throw new AppError("Invalid text input for embedding", 400);
    }

    const cleanText = text.replaceAll("\\n", " ").trim();

    const { embedding } = await embed({
      model: embeddingModel,
      value: cleanText,
    });

    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to generate embedding", 500);
  }
};

export const generateEmbeddings = async (texts) => {
  try {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new AppError("Invalid texts array for embeddings", 400);
    }

    const cleanTexts = texts
      .map((text) => text.replaceAll("\\n", " ").trim())
      .filter((text) => text.length > 0);

    if (cleanTexts.length === 0) {
      throw new AppError("No valid texts to embed", 400);
    }

    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: cleanTexts,
    });

    return embeddings.map((embedding, index) => ({
      content: cleanTexts[index],
      embedding: embedding,
    }));
  } catch (error) {
    console.error("Error generating embeddings:", error);
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to generate embeddings", 500);
  }
};

export const calculateCosineSimilarity = (embedding1, embedding2) => {
  if (!Array.isArray(embedding1) || !Array.isArray(embedding2)) {
    throw new AppError("Invalid embeddings for similarity calculation", 400);
  }

  if (embedding1.length !== embedding2.length) {
    throw new AppError("Embedding dimensions do not match", 400);
  }

  const dotProduct = embedding1.reduce(
    (sum, value, i) => sum + value * embedding2[i],
    0
  );

  const magnitude1 = Math.sqrt(
    embedding1.reduce((sum, value) => sum + value * value, 0)
  );
  const magnitude2 = Math.sqrt(
    embedding2.reduce((sum, value) => sum + value * value, 0)
  );

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
};

export const normalizeEmbedding = (embedding) => {
  const magnitude = Math.sqrt(
    embedding.reduce((sum, value) => sum + value * value, 0)
  );

  if (magnitude === 0) {
    return embedding;
  }

  return embedding.map((value) => value / magnitude);
};

export const validateEmbedding = (embedding, expectedDimension = null) => {
  if (!Array.isArray(embedding)) {
    return { valid: false, error: "Embedding must be an array" };
  }

  if (embedding.length === 0) {
    return { valid: false, error: "Embedding cannot be empty" };
  }

  if (expectedDimension && embedding.length !== expectedDimension) {
    return {
      valid: false,
      error: `Expected ${expectedDimension} dimensions, got ${embedding.length}`,
    };
  }

  const hasInvalidValues = embedding.some(
    (val) => typeof val !== "number" || !isFinite(val)
  );

  if (hasInvalidValues) {
    return { valid: false, error: "Embedding contains invalid numeric values" };
  }

  return { valid: true };
};

export const chunkText = (text, maxChunkSize = 1000, strategy = "sentence") => {
  if (!text || typeof text !== "string") {
    return [];
  }

  const cleanText = text.trim();
  if (cleanText.length === 0) {
    return [];
  }

  if (strategy === "sentence") {
    const sentences = cleanText
      .split(/[.!?]+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0);

    const chunks = [];
    let currentChunk = [];
    let currentSize = 0;

    for (const sentence of sentences) {
      const sentenceLength = sentence.length;

      if (
        currentSize + sentenceLength > maxChunkSize &&
        currentChunk.length > 0
      ) {
        chunks.push(currentChunk.join(". ") + ".");
        currentChunk = [sentence];
        currentSize = sentenceLength;
      } else {
        currentChunk.push(sentence);
        currentSize += sentenceLength + 2;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(". ") + ".");
    }

    return chunks.filter((chunk) => chunk.length > 3);
  }

  const words = cleanText.split(" ");
  const chunks = [];
  let currentChunk = [];
  let currentSize = 0;

  for (const word of words) {
    if (
      currentSize + word.length + 1 > maxChunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.join(" "));
      currentChunk = [word];
      currentSize = word.length;
    } else {
      currentChunk.push(word);
      currentSize += word.length + 1;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }

  return chunks;
};

export const findRelevantChunks = async (
  query,
  textChunks,
  topK = 3,
  similarityThreshold = 0.5
) => {
  try {
    if (!query || !Array.isArray(textChunks) || textChunks.length === 0) {
      return [];
    }

    const queryEmbedding = await generateEmbedding(query);

    const chunkEmbeddings = await generateEmbeddings(textChunks);

    const chunkSimilarities = chunkEmbeddings.map((chunkData, index) => {
      const similarity = calculateCosineSimilarity(
        queryEmbedding,
        chunkData.embedding
      );
      return {
        chunk: chunkData.content,
        similarity,
        index,
        embedding: chunkData.embedding,
      };
    });

    const relevantChunks = chunkSimilarities
      .filter((item) => item.similarity >= similarityThreshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return relevantChunks;
  } catch (error) {
    console.error("Error finding relevant chunks:", error);
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to find relevant content", 500);
  }
};

export const findRelevantContent = async (query, documents, options = {}) => {
  try {
    const {
      topK = 4,
      similarityThreshold = 0.5,
      chunkSize = 1000,
      chunkStrategy = "sentence",
    } = options;

    if (!query || !Array.isArray(documents) || documents.length === 0) {
      return [];
    }

    const allChunks = [];

    for (const doc of documents) {
      const chunks = chunkText(
        doc.content || doc.text || doc,
        chunkSize,
        chunkStrategy
      );
      chunks.forEach((chunk, chunkIndex) => {
        allChunks.push({
          content: chunk,
          documentId: doc._id || doc.id,
          documentTitle: doc.title || doc.name || "Untitled",
          chunkIndex,
          metadata: doc.metadata || {},
        });
      });
    }

    if (allChunks.length === 0) {
      return [];
    }

    const [queryEmbedding, chunkEmbeddings] = await Promise.all([
      generateEmbedding(query),
      generateEmbeddings(allChunks.map((chunk) => chunk.content)),
    ]);

    const similarities = chunkEmbeddings.map((chunkData, index) => {
      const similarity = calculateCosineSimilarity(
        queryEmbedding,
        chunkData.embedding
      );
      return {
        ...allChunks[index],
        similarity,
        embedding: chunkData.embedding,
      };
    });

    const relevantContent = similarities
      .filter((item) => item.similarity >= similarityThreshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return relevantContent;
  } catch (error) {
    console.error("Error finding relevant content:", error);
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to find relevant content", 500);
  }
};
