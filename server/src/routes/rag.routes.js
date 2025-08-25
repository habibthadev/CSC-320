import express from "express";
import {
  chatWithDocument,
  chatWithMultipleDocuments,
  generalChat,
} from "../controllers/rag.controller.js";
import { protect, optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/general-chat", optionalAuth, generalChat);
router.use(protect);

router.post("/chat", chatWithMultipleDocuments);
router.post("/chat/:documentId", chatWithDocument);

export default router;
