import Document from "../models/documentModel.js";
import Question from "../models/questionModel.js";
import { asyncHandler, AppError } from "../middleware/errorMiddleware.js";
import { generateQuestions, validateAnswer } from "../services/aiService.js";

// @desc    Generate questions from document
// @route   POST /api/questions/generate/:documentId
// @access  Private
export const generateQuestionsFromDocument = asyncHandler(async (req, res) => {
  const { numQuestions = 5, difficulty = "medium" } = req.body;
  const documentId = req.params.documentId;

  // Validate input
  if (!["easy", "medium", "hard"].includes(difficulty)) {
    throw new AppError("Difficulty must be easy, medium, or hard", 400);
  }

  if (numQuestions < 1 || numQuestions > 20) {
    throw new AppError("Number of questions must be between 1 and 20", 400);
  }

  // Find document
  const document = await Document.findOne({
    _id: documentId,
    user: req.user._id,
  });

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  // Generate questions using AI
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

  // Save questions to database
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

  res.json({
    success: true,
    preview: result.preview,
    count: savedQuestions.length,
    data: savedQuestions,
  });
});

// @desc    Validate answer
// @route   POST /api/questions/:id/validate
// @access  Private
export const validateUserAnswer = asyncHandler(async (req, res) => {
  const { userAnswer } = req.body;

  if (!userAnswer) {
    throw new AppError("User answer is required", 400);
  }

  // Find question
  const question = await Question.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  // Validate answer using AI
  const validation = await validateAnswer(
    question.question,
    question.correctAnswer,
    userAnswer
  );

  res.json({
    success: true,
    data: {
      questionId: question._id,
      result: validation.result,
      explanation: validation.explanation,
    },
  });
});

// @desc    Get questions by document
// @route   GET /api/questions/document/:documentId
// @access  Private
export const getQuestionsByDocument = asyncHandler(async (req, res) => {
  const questions = await Question.find({
    document: req.params.documentId,
    user: req.user._id,
  }).select("-correctAnswer");

  res.json({
    success: true,
    count: questions.length,
    data: questions,
  });
});

// @desc    Get all questions
// @route   GET /api/questions
// @access  Private
export const getAllQuestions = asyncHandler(async (req, res) => {
  const questions = await Question.find({
    user: req.user._id,
  })
    .select("-correctAnswer")
    .populate("document", "title");

  res.json({
    success: true,
    count: questions.length,
    data: questions,
  });
});

// @desc    Get question details
// @route   GET /api/questions/:id
// @access  Private
export const getQuestionById = asyncHandler(async (req, res) => {
  const question = await Question.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("document", "title");

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  res.json({
    success: true,
    data: question,
  });
});

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private
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
    message: "Question deleted",
  });
});
