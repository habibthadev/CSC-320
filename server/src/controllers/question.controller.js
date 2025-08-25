import Document from "../models/document.model.js";
import Question from "../models/question.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";
import { generateQuestions, validateAnswer } from "../services/ai.service.js";
import { cleanupTempFiles } from "../utils/file-processing.js";
import { NODE_ENV } from "../config/env.js";

export const generateQuestionsFromDocument = asyncHandler(async (req, res) => {
  const { numQuestions = 5, difficulty = "medium" } = req.body;
  const documentId = req.params.documentId;

  if (!["easy", "medium", "hard"].includes(difficulty)) {
    throw new AppError("Difficulty must be easy, medium, or hard", 400);
  }

  if (numQuestions < 1 || numQuestions > 20) {
    throw new AppError("Number of questions must be between 1 and 20", 400);
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
    const result = await generateQuestions(
      document.extractedText,
      numQuestions,
      difficulty
    );

    if (!result.questions || result.questions.length === 0) {
      return res.json({
        success: true,
        message: "Unable to generate questions from the provided document",
        preview: result.preview,
        questions: [],
      });
    }

    const savedQuestions = await Promise.all(
      result.questions.map(async (q) => {
        const questionDoc = await Question.create({
          user: req.user._id,
          document: document._id,
          question: q.question,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
          tags: req.body.tags || [],
        });

        return {
          _id: questionDoc._id,
          question: questionDoc.question,
          difficulty: questionDoc.difficulty,
        };
      })
    );

    if (NODE_ENV === "serverless") {
      cleanupTempFiles();
    }

    res.json({
      success: true,
      preview: result.preview,
      count: savedQuestions.length,
      data: savedQuestions,
    });
  } catch (error) {
    console.error("Question generation error:", error);
    throw new AppError("Failed to generate questions from document", 500);
  }
});

export const validateUserAnswer = asyncHandler(async (req, res) => {
  const { userAnswer } = req.body;

  if (!userAnswer || userAnswer.trim().length === 0) {
    throw new AppError("User answer is required and cannot be empty", 400);
  }

  if (userAnswer.length > 500) {
    throw new AppError(
      "Answer is too long. Maximum 500 characters allowed",
      400
    );
  }

  const question = await Question.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).lean();

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  try {
    const validation = await validateAnswer(
      question.question,
      question.correctAnswer,
      userAnswer.trim()
    );

    if (NODE_ENV === "serverless") {
      cleanupTempFiles();
    }

    res.json({
      success: true,
      data: {
        questionId: question._id,
        result: validation.result,
        explanation: validation.explanation,
        correctAnswer: question.correctAnswer,
        userAnswer: userAnswer.trim(),
      },
    });
  } catch (error) {
    console.error("Answer validation error:", error);
    throw new AppError("Failed to validate answer", 500);
  }
});

export const getQuestionsByDocument = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const questions = await Question.find({
    document: req.params.documentId,
    user: req.user._id,
  })
    .select("-correctAnswer")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Question.countDocuments({
    document: req.params.documentId,
    user: req.user._id,
  });

  res.json({
    success: true,
    count: questions.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: questions,
  });
});

export const getAllQuestions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const difficulty = req.query.difficulty;

  let filter = { user: req.user._id };
  if (difficulty && ["easy", "medium", "hard"].includes(difficulty)) {
    filter.difficulty = difficulty;
  }

  const questions = await Question.find(filter)
    .select("-correctAnswer")
    .populate("document", "title")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Question.countDocuments(filter);

  res.json({
    success: true,
    count: questions.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: questions,
  });
});

export const getQuestionById = asyncHandler(async (req, res) => {
  const question = await Question.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate("document", "title")
    .lean();

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  res.json({
    success: true,
    data: question,
  });
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  await question.deleteOne();

  res.json({
    success: true,
    message: "Question deleted successfully",
  });
});

export const bulkDeleteQuestions = asyncHandler(async (req, res) => {
  const { questionIds } = req.body;

  if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
    throw new AppError("Question IDs are required", 400);
  }

  const result = await Question.deleteMany({
    _id: { $in: questionIds },
    user: req.user._id,
  });

  res.json({
    success: true,
    message: `${result.deletedCount} questions deleted successfully`,
    deletedCount: result.deletedCount,
  });
});
