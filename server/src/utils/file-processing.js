import fs from "fs";
import os from "os";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import mammoth from "mammoth";
import { createWorker } from "tesseract.js";
import { AppError } from "../middleware/error.middleware.js";
import { NODE_ENV, UPLOAD_DIR } from "../config/env.js";

const uploadsDir = UPLOAD_DIR || path.join(os.tmpdir(), "uploads");

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

let workerCache = null;

export const extractTextFromImage = async (buffer, mimetype) => {
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

  let worker = null;

  try {
    if (NODE_ENV === "serverless") {
      worker = await createWorker({
        logger: () => {},
        corePath:
          "https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0/tesseract-core-simd.js",
        workerPath:
          "https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/worker.min.js",
        langPath: "https://tessdata.projectnaptha.com/4.0.0_best",
        cachePath: "/tmp",
        gzip: false,
      });
    } else {
      if (!workerCache) {
        workerCache = await createWorker({
          logger: (m) => console.log(m),
        });
      }
      worker = workerCache;
    }

    await worker.loadLanguage("eng");
    await worker.initialize("eng");

    const {
      data: { text },
    } = await worker.recognize(buffer);

    if (NODE_ENV === "serverless") {
      await worker.terminate();
    }

    return text || "No text found in image.";
  } catch (error) {
    if (worker && NODE_ENV === "serverless") {
      try {
        await worker.terminate();
      } catch (terminateError) {
        console.error("Error terminating worker:", terminateError);
      }
    }
    throw new AppError(`Error in OCR processing: ${error.message}`, 400);
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

  try {
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
  } catch (error) {
    console.error("File processing error:", error);
    throw error;
  }
};

export const cleanupTempFiles = () => {
  if (NODE_ENV !== "serverless") return;

  try {
    const tempFiles = fs.readdirSync("/tmp");
    tempFiles.forEach((file) => {
      if (file.startsWith("tess-")) {
        try {
          fs.unlinkSync(path.join("/tmp", file));
        } catch (e) {
          console.log("Could not clean temp file:", file);
        }
      }
    });
  } catch (e) {
    console.log("Could not clean temp directory");
  }
};
