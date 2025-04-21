import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppError } from "../middleware/errorMiddleware.js";

// Initialize GoogleGenerativeAI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate response from Gemini model
export const generateGeminiResponse = async (
  prompt,
  responseType = "application/json"
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chatSession = model.startChat({
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: responseType,
      },
    });

    const result = await chatSession.sendMessage(prompt);
    return responseType === "application/json"
      ? JSON.parse(result.response.text())
      : result.response.text();
  } catch (error) {
    console.error("Error with Gemini Chat API:", error);
    throw new AppError("Failed to generate response using Gemini API", 500);
  }
};

// Generate questions from document content
export const generateQuestions = async (content, numQuestions, difficulty) => {
  const prompt = `
    Based on the following document content:
    ${content}
    
    Generate ${numQuestions} questions of ${difficulty} difficulty.
    If the content is empty or there's no context for you to generate questions, 
    "questions" should be an empty array and 'preview' should tell the user to provide 
    a better document that is well-structured or scanned.
    
    Format the response as:
    {
      "preview": "A short summary of the content of the document",
      "questions": [
        { "question": "The question text", "difficulty": "${difficulty}", "correctAnswer": "The correct answer" }
      ]
    }
  `;

  return generateGeminiResponse(prompt);
};

// Validate user's answer
export const validateAnswer = async (question, correctAnswer, userAnswer) => {
  const prompt = `
    Question: ${question}
    Correct Answer: ${correctAnswer}
    User's Answer: ${userAnswer}

    Evaluate if the user's answer is correct. 
    The user's answer doesn't need to be word-for-word identical to the correct answer, 
    but it should capture the essence of the correct answer. 
    Provide your evaluation in the following format:
    {
      "result": "Correct" or "Incorrect",
      "explanation": "${correctAnswer}"
    }
  `;

  return generateGeminiResponse(prompt);
};

// Generate RAG response
export const generateRagResponse = async (query, context) => {
  const prompt = `
    Based on the following document content:
    ${context}
    
    Answer the following question:
    ${query}
    
    If the document content doesn't contain relevant information to answer the question,
    please respond with: "I don't have enough information from the provided documents to answer this question."
    
    Format your response in a clear and concise manner.
  `;

  return generateGeminiResponse(prompt, "text/plain");
};
