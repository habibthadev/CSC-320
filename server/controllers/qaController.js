import { GoogleGenerativeAI } from "@google/generative-ai";
import Question from "../models/questionModel.js";
import Document from "../models/documentModel.js";
import { catchAsync } from "../utils/catch-async.js";
import AppError from "../utils/app-error.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function AiResponse(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chatSession = model.startChat({
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error with Gemini Chat API:", error);
    throw new AppError(
      "Failed to generate response using Gemini Chat API",
      500
    );
  }
}

export const generateQuestions = catchAsync(async (req, res, next) => {
  const documentId = req.params.documentId;
  const { numQuestions, difficulty } = req.query;

  if (!numQuestions || !difficulty) {
    return next(
      new AppError("Missing numQuestions or difficulty parameters", 400)
    );
  }

  // Find the document
  const document = await Document.findById(documentId);

  if (!document) {
    return next(new AppError("No document found with that ID", 404));
  }

  // Check if user has access to the document
  const isOwner = document.owner._id.toString() === req.user._id.toString();
  const isShared = document.shared.some(
    (id) => id.toString() === req.user._id.toString()
  );

  if (!isOwner && !isShared) {
    return next(
      new AppError("You do not have permission to access this document", 403)
    );
  }

  // Generate questions using the document's extracted text
  const prompt = `
    Based on the following document content:
    ${document.extractedText}
    
    Generate ${numQuestions} questions of ${difficulty} difficulty.
    Format the response as:
    {
      "preview": "A short summary of the content of the document",
      "questions": [
        { "question": "The question text", "difficulty": "${difficulty}", "correctAnswer": "The correct answer" }
      ]
    }
  `;

  // Generate questions using the Gemini API chat
  const response = await AiResponse(prompt);
  const parsedResponse = JSON.parse(response);

  // Save the generated questions to the database
  const savedQuestions = [];
  for (const q of parsedResponse.questions) {
    const question = await Question.create({
      question: q.question,
      difficulty: q.difficulty,
      correctAnswer: q.correctAnswer,
      document: documentId,
      createdBy: req.user._id,
    });
    savedQuestions.push(question);
  }

  res.status(200).json({
    status: "success",
    data: {
      preview: parsedResponse.preview,
      questions: savedQuestions,
    },
  });
});

export const validateAnswer = catchAsync(async (req, res, next) => {
  const { questionId, userAnswer } = req.body;

  if (!questionId || !userAnswer) {
    return next(
      new AppError("Missing questionId or userAnswer in request body", 400)
    );
  }

  // Find the question
  const question = await Question.findById(questionId);

  if (!question) {
    return next(new AppError("No question found with that ID", 404));
  }

  // Check if the user has access to the document this question is for
  const document = await Document.findById(question.document);

  const isOwner = document.owner._id.toString() === req.user._id.toString();
  const isShared = document.shared.some(
    (id) => id.toString() === req.user._id.toString()
  );

  if (!isOwner && !isShared) {
    return next(
      new AppError("You do not have permission to access this question", 403)
    );
  }

  const prompt = `
    Question: ${question.question}
    Correct Answer: ${question.correctAnswer}
    User's Answer: ${userAnswer}

    Evaluate if the user's answer is correct. 
    The user's answer doesn't need to be word-for-word identical to the correct answer, but it should capture the essence of the correct answer. 
    Provide your evaluation in the following format:
    {
      "result": "Correct" or "Incorrect",
      "explanation": "Explanation of why the answer is correct or incorrect"
    }
  `;

  const response = await AiResponse(prompt);
  const validation = JSON.parse(response);

  res.status(200).json({
    status: "success",
    data: validation,
  });
});

export const getQuestionsForDocument = catchAsync(async (req, res, next) => {
  const documentId = req.params.documentId;

  // Find the document
  const document = await Document.findById(documentId);

  if (!document) {
    return next(new AppError("No document found with that ID", 404));
  }

  // Check if user has access to the document
  const isOwner = document.owner._id.toString() === req.user._id.toString();
  const isShared = document.shared.some(
    (id) => id.toString() === req.user._id.toString()
  );

  if (!isOwner && !isShared) {
    return next(
      new AppError("You do not have permission to access this document", 403)
    );
  }

  // Find all questions for this document
  const questions = await Question.find({ document: documentId });

  res.status(200).json({
    status: "success",
    results: questions.length,
    data: {
      questions,
    },
  });
});
