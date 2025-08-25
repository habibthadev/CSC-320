import { google } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import { AppError } from "../middleware/error.middleware.js";
import { GOOGLE_GENERATIVE_AI_API_KEY } from "../config/env.js";

const model = google("gemini-2.0-flash", {
  apiKey: GOOGLE_GENERATIVE_AI_API_KEY,
});

const questionSchema = z.object({
  preview: z.string().describe("A short summary of the document content"),
  questions: z.array(
    z.object({
      question: z.string(),
      difficulty: z.string(),
      correctAnswer: z.string(),
    })
  ),
});

const answerValidationSchema = z.object({
  result: z.enum(["Correct", "Incorrect"]),
  explanation: z.string(),
});

export const generateQuestions = async (content, numQuestions, difficulty) => {
  try {
    if (!content || content.trim().length === 0) {
      return {
        preview:
          "No content provided. Please upload a well-structured document.",
        questions: [],
      };
    }

    const prompt = `Based on the following document content, generate ${numQuestions} questions of ${difficulty} difficulty.

Document content:
${content}

If the content is empty or lacks context for question generation, return empty questions array and explain in preview.

Requirements:
- Questions should test understanding of the key concepts
- Answers should be concise but complete
- Difficulty should match: ${difficulty}`;

    const result = await generateObject({
      model,
      schema: questionSchema,
      prompt,
      temperature: 0.7,
    });

    return result.object;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new AppError("Failed to generate questions using AI", 500);
  }
};

export const validateAnswer = async (question, correctAnswer, userAnswer) => {
  try {
    const prompt = `Evaluate if the user's answer is correct compared to the expected answer.

Question: ${question}
Expected Answer: ${correctAnswer}
User's Answer: ${userAnswer}

The user's answer doesn't need to be word-for-word identical but should capture the essence of the correct answer.`;

    const result = await generateObject({
      model,
      schema: answerValidationSchema,
      prompt,
      temperature: 0.3,
    });

    return result.object;
  } catch (error) {
    console.error("Error validating answer:", error);
    throw new AppError("Failed to validate answer using AI", 500);
  }
};

export const generateRagResponse = async (query, context) => {
  try {
    if (!context || context.trim().length === 0) {
      return "I don't have any document content to reference for answering your question.";
    }

    const prompt = `Based on the following document content, answer the user's question.

Document content:
${context}

User question: ${query}

Instructions:
- Answer based only on the provided document content
- If the document doesn't contain relevant information, state that clearly
- Provide a clear, concise answer
- Do not make up information not in the document`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.5,
      maxTokens: 1000,
    });

    return result.text;
  } catch (error) {
    console.error("Error generating RAG response:", error);
    throw new AppError("Failed to generate response using AI", 500);
  }
};

export const generateChatResponse = async (message, context = null) => {
  try {
    let prompt = `You are a helpful AI assistant. Answer the user's question clearly and concisely.

User question: ${message}`;

    if (context) {
      prompt = `You are a helpful AI assistant with access to document content. Use the provided context to answer the user's question.

Context:
${context}

User question: ${message}

Answer based on the context when relevant, but you can also provide general knowledge if the context doesn't contain the needed information.`;
    }

    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 1500,
    });

    return result.text;
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new AppError("Failed to generate chat response using AI", 500);
  }
};

export const summarizeDocument = async (content, maxLength = 200) => {
  try {
    if (!content || content.trim().length === 0) {
      return "No content to summarize.";
    }

    const prompt = `Summarize the following document content in about ${maxLength} words:

${content}

Provide a clear, concise summary that captures the main points and key information.`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.5,
      maxTokens: Math.floor(maxLength * 1.5),
    });

    return result.text;
  } catch (error) {
    console.error("Error summarizing document:", error);
    throw new AppError("Failed to summarize document using AI", 500);
  }
};
