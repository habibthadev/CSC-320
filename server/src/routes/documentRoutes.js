import express from "express";
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  vectorizeDocument,
  searchDocuments,
  upload,
} from "../controllers/documentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.use(protect);

router.route("/").get(getDocuments).post(upload.array("files"), uploadDocument);

router.get("/search", searchDocuments);

router
  .route("/:id")
  .get(getDocumentById)
  .put(updateDocument)
  .delete(deleteDocument);

router.post("/:id/vectorize", vectorizeDocument);

export default router;
