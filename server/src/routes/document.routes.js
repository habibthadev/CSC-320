import express from "express";
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  bulkDeleteDocuments,
  vectorizeDocument,
  searchDocuments,
  getDocumentStats,
  upload,
} from "../controllers/document.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getDocuments)
  .post(upload.array("files", 5), uploadDocument);

router.get("/stats", getDocumentStats);
router.get("/search", searchDocuments);
router.post("/bulk-delete", bulkDeleteDocuments);

router
  .route("/:id")
  .get(getDocumentById)
  .put(updateDocument)
  .delete(deleteDocument);

router.post("/:id/vectorize", vectorizeDocument);

export default router;
