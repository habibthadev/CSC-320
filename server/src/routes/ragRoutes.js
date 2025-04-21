import express from "express";
import {
  chatWithDocument,
  chatWithMultipleDocuments,
} from "../controllers/ragController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.use(protect);

router.post("/chat", chatWithMultipleDocuments);
router.post("/chat/:documentId", chatWithDocument);

export default router;
