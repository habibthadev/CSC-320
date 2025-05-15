import fs from "fs";
import os from "os";
import path from "path";
import PDFParser from "pdf2json";
import mammoth from "mammoth";
import { createWorker } from "tesseract.js";
import { fileURLToPath } from "url";
import { AppError } from "../middleware/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const uploadsDir = path.join(__dirname, "../uploads");

const uploadsDir = path.join(os.tmpdir(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const cleanText = (text) => {
  return text.replace(/\s\s+/g, " ").replace(/\n+/g, " ").trim();
};

// export const extractTextFromPDF = (buffer) => {
//   return new Promise((resolve, reject) => {
//     const pdfParser = new PDFParser();

//     pdfParser.on("pdfParser_dataError", (errData) => {
//       reject(
//         new AppError(`Error extracting text: ${errData.parserError}`, 400)
//       );
//     });

//     pdfParser.on("pdfParser_dataReady", (pdfData) => {
//       const text = pdfData.formImage.Pages.map((page) =>
//         page.Texts.map((t) =>
//           decodeURIComponent(t.R.map((r) => r.T).join(""))
//         ).join(" ")
//       ).join("\n");
//       resolve(text || "No text found in PDF.");
//     });

//     pdfParser.parseBuffer(buffer);
//   });
// };

const extractTextFromPDF = async (buffer) => {
  try {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on("pdfParser_dataError", (error) => {
        reject(new Error(`Error extracting text from PDF: ${error.message}`));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        const text = pdfParser.getRawTextContent();
        resolve(text || "No text found in PDF.");
      });

      pdfParser.parseBuffer(buffer);
    });
  } catch (error) {
    throw new Error(`Error extracting text from PDF: ${error.message}`);
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
