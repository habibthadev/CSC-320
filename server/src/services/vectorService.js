import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppError } from "../middleware/errorMiddleware.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize GoogleGenerativeAI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });

// Generate embeddings for text
export const generateEmbedding = async (text) => {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new AppError("Failed to generate embedding", 500);
  }
};

// Calculate cosine similarity between two embeddings
export const calculateCosineSimilarity = (embedding1, embedding2) => {
  // Calculate dot product
  const dotProduct = embedding1.reduce(
    (sum, value, i) => sum + value * embedding2[i],
    0
  );

  // Calculate magnitudes
  const magnitude1 = Math.sqrt(
    embedding1.reduce((sum, value) => sum + value * value, 0)
  );
  const magnitude2 = Math.sqrt(
    embedding2.reduce((sum, value) => sum + value * value, 0)
  );

  // Calculate cosine similarity
  return dotProduct / (magnitude1 * magnitude2);
};

// Chunk text into smaller segments
export const chunkText = (text, maxChunkSize = 1000) => {
  const words = text.split(" ");
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
      currentSize += word.length + 1; // +1 for the space
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }

  return chunks;
};

// Find most relevant chunks for a query
export const findRelevantChunks = async (query, textChunks, topK = 3) => {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Generate embeddings for each chunk and calculate similarity
    const chunkSimilarities = await Promise.all(
      textChunks.map(async (chunk, index) => {
        const chunkEmbedding = await generateEmbedding(chunk);
        const similarity = calculateCosineSimilarity(
          queryEmbedding,
          chunkEmbedding
        );
        return { chunk, similarity, index };
      })
    );

    // Sort by similarity (descending)
    const sortedChunks = chunkSimilarities.sort(
      (a, b) => b.similarity - a.similarity
    );

    // Return top K chunks
    return sortedChunks.slice(0, topK);
  } catch (error) {
    console.error("Error finding relevant chunks:", error);
    throw new AppError("Failed to find relevant content", 500);
  }
};
