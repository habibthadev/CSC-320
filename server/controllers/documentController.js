import multer from "multer";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Document from "../models/documentModel.js";
import User from "../models/userModel.js";
import { catchAsync } from "../utils/catch-async.js";
import AppError from "../utils/app-error.js";
import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";
import mammoth from "mammoth";
// Setup multer storage
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  const supportedTypes = [
    "application/pdf",
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/bmp",
    "image/tiff",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
  ];

  if (supportedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Unsupported file type. Please upload a PDF, image, DOCX, or TXT file.",
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export const uploadDocument = upload.array("files", 5); // Allow up to 5 files

function cleanText(text) {
  return text.replace(/\s\s+/g, " ").replace(/\n+/g, " ").trim();
}

async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text || "No text found in PDF.";
  } catch (error) {
    throw new AppError("Error processing PDF file", 400);
  }
}

async function extractTextFromImage(buffer, mimetype) {
  const worker = await createWorker("eng");

  const supportedFormats = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/bmp",
    "image/tiff",
  ];

  if (!supportedFormats.includes(mimetype)) {
    throw new AppError(
      "Unsupported image format. Please use PNG, JPEG, BMP, or TIFF.",
      400
    );
  }

  try {
    const {
      data: { text },
    } = await worker.recognize(buffer);
    return text;
  } catch (error) {
    throw new AppError("Error in processing Image", 400);
  } finally {
    await worker.terminate();
  }
}

async function extractTextFromDocx(buffer) {
  try {
    const { value: text } = await mammoth.extractRawText({ buffer });
    return text;
  } catch (error) {
    throw new AppError("Error processing DOCX file", 400);
  }
}

async function extractTextFromTxt(buffer) {
  try {
    return buffer.toString();
  } catch (error) {
    throw new AppError("Error processing TXT file", 400);
  }
}

// Save buffer to disk
const saveBufferToDisk = (buffer, filename) => {
  const uploadsDir = path.join(__dirname, "../uploads");

  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, buffer);

  return filepath;
};

export const createDocument = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError("No files uploaded", 400));
  }

  const documents = [];

  for (const file of req.files) {
    const { buffer, mimetype, originalname } = file;

    // Generate a unique filename
    const fileKey = `${Date.now()}-${originalname.replace(/\s/g, "_")}`;

    // Save file to disk
    const filepath = saveBufferToDisk(buffer, fileKey);

    // Extract file type
    let type;
    let extractedText = "";

    if (mimetype === "application/pdf") {
      type = "pdf";
      extractedText = await extractTextFromPDF(buffer);
    } else if (mimetype.startsWith("image/")) {
      type = "image";
      extractedText = await extractTextFromImage(buffer, mimetype);
    } else if (mimetype === "text/plain") {
      type = "txt";
      extractedText = await extractTextFromTxt(buffer);
    } else if (
      mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimetype === "application/msword"
    ) {
      type = "docx";
      extractedText = await extractTextFromDocx(buffer);
    }

    // Create document in database
    const document = await Document.create({
      name: originalname,
      type,
      fileKey,
      fileUrl: `/uploads/${fileKey}`,
      extractedText: cleanText(extractedText),
      owner: req.user._id,
    });

    documents.push(document);
  }

  res.status(201).json({
    status: "success",
    results: documents.length,
    data: {
      documents,
    },
  });
});

export const getAllDocuments = catchAsync(async (req, res, next) => {
  // Find all documents owned by the user or shared with the user
  const documents = await Document.find({
    $or: [{ owner: req.user._id }, { shared: req.user._id }],
  });

  res.status(200).json({
    status: "success",
    results: documents.length,
    data: {
      documents,
    },
  });
});

export const getDocument = catchAsync(async (req, res, next) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return next(new AppError("No document found with that ID", 404));
  }

  // Check if user has access to the document
  const isOwner = document.owner._id.toString() === req.user._id.toString();
  const isShared = document.shared.some(
    (id) => id.toString() === req.user._id.toString()
  );

  if (!isOwner && !isShared) {
    return next(
      new AppError("You do not have permission to access this document", 403)
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      document,
    },
  });
});

export const shareDocument = catchAsync(async (req, res, next) => {
  // Get the email of the user to share with
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Please provide an email to share with", 400));
  }

  // Find the user to share with
  const userToShare = await User.findOne({ email });

  if (!userToShare) {
    return next(new AppError("No user found with that email", 404));
  }

  // Find the document
  const document = await Document.findById(req.params.id);

  if (!document) {
    return next(new AppError("No document found with that ID", 404));
  }

  // Check if the current user is the owner
  if (document.owner._id.toString() !== req.user._id.toString()) {
    return next(
      new AppError("You must be the owner to share this document", 403)
    );
  }

  // Check if the document is already shared with this user
  if (document.shared.includes(userToShare._id)) {
    return next(new AppError("Document already shared with this user", 400));
  }

  // Add the user to the shared array
  document.shared.push(userToShare._id);
  await document.save();

  res.status(200).json({
    status: "success",
    data: {
      document,
    },
  });
});

export const unshareDocument = catchAsync(async (req, res, next) => {
  // Get the email of the user to unshare with
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Please provide an email to unshare with", 400));
  }

  // Find the user to unshare with
  const userToUnshare = await User.findOne({ email });

  if (!userToUnshare) {
    return next(new AppError("No user found with that email", 404));
  }

  // Find the document
  const document = await Document.findById(req.params.id);

  if (!document) {
    return next(new AppError("No document found with that ID", 404));
  }

  // Check if the current user is the owner
  if (document.owner._id.toString() !== req.user._id.toString()) {
    return next(
      new AppError("You must be the owner to unshare this document", 403)
    );
  }

  // Remove the user from the shared array
  document.shared = document.shared.filter(
    (id) => id.toString() !== userToUnshare._id.toString()
  );
  await document.save();

  res.status(200).json({
    status: "success",
    data: {
      document,
    },
  });
});

export const deleteDocument = catchAsync(async (req, res, next) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return next(new AppError("No document found with that ID", 404));
  }

  // Check if the current user is the owner
  if (document.owner._id.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only delete your own documents", 403));
  }

  // Delete the file from disk
  const filepath = path.join(__dirname, "..", document.fileUrl);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }

  // Delete the document from the database
  await Document.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
