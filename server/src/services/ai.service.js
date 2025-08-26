import { google } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import { AppError } from "../middleware/error.middleware.js";
import { GOOGLE_GENERATIVE_AI_API_KEY } from "../config/env.js";

const model = google("gemini-2.0-flash", {
  apiKey: GOOGLE_GENERATIVE_AI_API_KEY,
});

const modelWithSearch = google("gemini-2.0-flash", {
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

export const generateRagResponse = async (
  query,
  context,
  conversationHistory = []
) => {
  try {
    if (!context || context.trim().length === 0) {
      return "I don't have any document content to reference for answering your question.";
    }

    let conversationContext = "";
    if (conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-6);
      conversationContext = `

Previous conversation context:
${recentHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

---

`;
    }

    const prompt = `Based on the following document content and conversation history, answer the user's question.
${conversationContext}
Document content:
${context}

Current user question: ${query}

Instructions:
- Answer based only on the provided document content
- Use the conversation history to better understand the context and user's intent
- If the document doesn't contain relevant information, state that clearly
- Provide a clear, concise answer
- Do not make up information not in the document
- Reference specific parts of the document when applicable`;

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

export const generateChatResponse = async (
  message,
  conversationHistory = [],
  context = null
) => {
  try {
    let conversationContext = "";
    if (conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-8);
      conversationContext = `

Previous conversation:
${recentHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

---

`;
    }

    const needsWebSearch = await shouldUseWebSearch(
      message,
      conversationHistory
    );

    if (needsWebSearch) {
      const result = await generateText({
        model: modelWithSearch,
        tools: {
          google_search: google.tools.googleSearch({}),
        },
        prompt: `${conversationContext}You are a helpful AI assistant with access to real-time web information. Answer the user's question using current information from the web when relevant.

Current user question: ${message}

Instructions:
- Use web search to find current, accurate information
- Provide citations and sources for your information
- Be comprehensive but concise
- Include relevant links when available`,
        temperature: 0.7,
        maxTokens: 1500,
      });

      return {
        text: result.text,
        sources: result.sources || [],
        hasWebSearch: true,
      };
    } else {
      let prompt = `${conversationContext}You are a helpful AI assistant. Answer the user's question clearly and concisely based on your knowledge and the conversation context.

Current user question: ${message}`;

      if (context) {
        prompt = `${conversationContext}You are a helpful AI assistant with access to document content. Use the provided context to answer the user's question.

Context:
${context}

Current user question: ${message}

Answer based on the context when relevant, but you can also provide general knowledge if the context doesn't contain the needed information.`;
      }

      const result = await generateText({
        model,
        prompt,
        temperature: 0.7,
        maxTokens: 1500,
      });

      return {
        text: result.text,
        sources: [],
        hasWebSearch: false,
      };
    }
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new AppError("Failed to generate chat response using AI", 500);
  }
};

const shouldUseWebSearch = async (message, conversationHistory = []) => {
  try {
    const prompt = `Analyze this user message and conversation history to determine if real-time web information is needed.

Message: "${message}"

Conversation context: ${conversationHistory
      .slice(-4)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n")}

Return true if the query involves:
- Current events, news, or recent developments
- Real-time data (weather, stock prices, sports scores)
- Recent technology updates or releases
- Current market information
- Time-sensitive information
- Questions about "latest", "recent", "current", "today", "this week", etc.

Return false for:
- General knowledge questions
- Historical information
- Theoretical discussions
- Personal advice
- Math/calculations
- Programming help (unless about recent frameworks/updates)

Response format: just "true" or "false"`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.1,
      maxTokens: 10,
    });

    return result.text.toLowerCase().trim() === "true";
  } catch (error) {
    console.error("Error determining web search need:", error);
    return false;
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
