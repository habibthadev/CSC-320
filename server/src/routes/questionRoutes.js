import express from "express";
import {
  generateQuestionsFromDocument,
  validateUserAnswer,
  getQuestionsByDocument,
  getAllQuestions,
  getQuestionById,
  deleteQuestion,
} from "../controllers/questionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.use(protect);

router.get("/", getAllQuestions);
router.get("/document/:documentId", getQuestionsByDocument);
router.post("/generate/:documentId", generateQuestionsFromDocument);

router.route("/:id").get(getQuestionById).delete(deleteQuestion);

router.post("/:id/validate", validateUserAnswer);

export default router;
