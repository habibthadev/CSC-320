# Haskmee Backend

A powerful document processing backend with authentication, document storage, question generation, and RAG (Retrieval-Augmented Generation) capabilities built using Node.js, Express, MongoDB, and Google's Gemini AI.

## Features

- **User Authentication**
  - Register, login, profile management
  - Password reset using OTP via email
  - JWT-based authentication with refresh tokens

- **Document Management**
  - Upload and process multiple file types (PDF, DOCX, TXT, images)
  - Extract text using appropriate methods for each file type
  - OCR for images using Tesseract.js
  - Store and search documents

- **Question Generation**
  - Generate questions from documents. 