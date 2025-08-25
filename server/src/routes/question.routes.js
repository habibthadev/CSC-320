import express from "express";
import {
  generateQuestionsFromDocument,
  validateUserAnswer,
  getQuestionsByDocument,
  getAllQuestions,
  getQuestionById,
  deleteQuestion,
  bulkDeleteQuestions,
} from "../controllers/question.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllQuestions);
router.post("/bulk-delete", bulkDeleteQuestions);
router.get("/document/:documentId", getQuestionsByDocument);
router.post("/generate/:documentId", generateQuestionsFromDocument);

router.route("/:id").get(getQuestionById).delete(deleteQuestion);

router.post("/:id/validate", validateUserAnswer);

export default router;
