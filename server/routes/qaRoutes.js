import { Router } from "express";
import * as qaController from "../controllers/qaController.js";
import * as conversationController from "../controllers/conversationController.js";
import * as authController from "../controllers/authController.js";

const { getQuestionsForDocument, generateQuestions, validateAnswer } =
  qaController;
const {
  getUserConversations,
  createConversation,
  getConversation,
  continueConversation,
  deleteConversation,
} = conversationController;
const { protect } = authController;

const router = Router();

// Protect all routes
router.use(protect);

// Question generation and validation routes
router.get("/document/:documentId/questions", getQuestionsForDocument);
router.post("/document/:documentId/generate-questions", generateQuestions);
router.post("/validate-answer", validateAnswer);

// Conversation routes
router.get("/conversations", getUserConversations);
router.post("/conversations", createConversation);
router.get("/conversations/:id", getConversation);
router.post("/conversations/:id", continueConversation);
router.delete("/conversations/:id", deleteConversation);

export default router;
