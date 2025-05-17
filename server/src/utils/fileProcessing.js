import fs from "fs";
import os from "os";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import mammoth from "mammoth";
import { createWorker } from "tesseract.js";
import { AppError } from "../middleware/errorMiddleware.js";

// const uploadsDir = path.join(__dirname, "../uploads");

const uploadsDir = path.join(os.tmpdir(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const cleanText = (text) => {
  return text.replace(/\s\s+/g, " ").replace(/\n+/g, " ").trim();
};

const extractTextFromPDF = async (buffer) => {
  try {
    if (!buffer) {
      throw new AppError("No PDF buffer provided", 400);
    }

    const data = await pdfParse(buffer);
    return data.text || "No text found in PDF.";
  } catch (error) {
    throw new AppError(`Error extracting text from PDF: ${error.message}`, 400);
  }
};

export const extractTextFromDocx = async (buffer) => {
  try {
    const { value: text } = await mammoth.extractRawText({ buffer });
    return text || "No text found in DOCX.";
  } catch (error) {
    throw new AppError(
      `Error extracting text from DOCX: ${error.message}`,
      400
    );
  }
};

export const extractTextFromTxt = (buffer) => {
  try {
    return buffer.toString("utf8");
  } catch (error) {
    throw new AppError(`Error extracting text from TXT: ${error.message}`, 400);
  }
};

export const extractTextFromImage = async (buffer, mimetype) => {
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
    return text || "No text found in image.";
  } catch (error) {
    throw new AppError(`Error in OCR processing: ${error.message}`, 400);
  } finally {
    await worker.terminate();
  }
};

export const saveFileToDisk = async (file, userId) => {
  const userDir = path.join(uploadsDir, userId.toString());
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  const timestamp = Date.now();
  const uniqueFilename = `${timestamp}-${file.originalname.replace(
    /\s+/g,
    "_"
  )}`;
  const filePath = path.join(userDir, uniqueFilename);

  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, file.buffer, (err) => {
      if (err) {
        reject(new AppError(`Error saving file to disk: ${err.message}`, 500));
      } else {
        resolve({
          originalFileName: file.originalname,
          storagePath: filePath,
          fileType: file.mimetype,
          fileSize: file.size,
        });
      }
    });
  });
};

export const processFile = async (file) => {
  const { buffer, mimetype } = file;
  let extractedText = "";

  if (mimetype === "application/pdf") {
    extractedText = await extractTextFromPDF(buffer);
  } else if (mimetype.startsWith("image/")) {
    extractedText = await extractTextFromImage(buffer, mimetype);
  } else if (mimetype === "text/plain") {
    extractedText = extractTextFromTxt(buffer);
  } else if (
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimetype === "application/msword"
  ) {
    extractedText = await extractTextFromDocx(buffer);
  } else {
    throw new AppError("Unsupported file type", 400);
  }

  return cleanText(extractedText);
};
