import { Router } from "express";
import * as documentController from "../controllers/documentController.js";
import * as authController from "../controllers/authController.js";

const {
  uploadDocument,
  createDocument,
  getAllDocuments,
  getDocument,
  deleteDocument,
  shareDocument,
  unshareDocument,
} = documentController;
const { protect } = authController;

const router = Router();

// Protect all routes
router.use(protect);

router.get("/", getAllDocuments);
router.post("/", uploadDocument, createDocument);

router.get("/:id", getDocument);
router.delete("/:id", deleteDocument);

router.post("/:id/share", shareDocument);

router.post("/:id/unshare", unshareDocument);

export default router;
