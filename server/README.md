# CSC-320 Server - Optimized for Vercel Serverless

## Features

- ✅ **Serverless-optimized** for Vercel deployment
- ✅ **Tesseract.js** configured for serverless environment
- ✅ **Vercel AI SDK v5** with Gemini provider for RAG and chat
- ✅ **Enhanced JWT session management** with token caching
- ✅ **Improved error handling** and validation
- ✅ **Database connection caching** for better performance
- ✅ **File processing optimization** with temp file cleanup
- ✅ **Comprehensive API endpoints** with pagination and bulk operations

## Tech Stack

- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **AI**: Vercel AI SDK v5 + Google Gemini
- **OCR**: Tesseract.js (serverless-optimized)
- **Authentication**: JWT with secure session management
- **File Processing**: PDF, DOCX, TXT, and image support
- **Deployment**: Vercel Serverless Functions

## Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Required Environment Variables**:

   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Strong secret for JWT signing
   - `GEMINI_API_KEY`: Google Gemini API key
   - `NODE_ENV`: Set to "production" for Vercel

4. **Local development**:

   ```bash
   npm run dev
   ```

5. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/validate` - Validate token
- `DELETE /api/auth/account` - Delete account

### Documents

- `GET /api/documents` - List documents (paginated)
- `POST /api/documents` - Upload documents (max 5 files)
- `GET /api/documents/stats` - Get document statistics
- `GET /api/documents/search` - Search documents
- `POST /api/documents/bulk-delete` - Bulk delete documents
- `GET /api/documents/:id` - Get document by ID
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/vectorize` - Vectorize document

### Questions

- `GET /api/questions` - List all questions (paginated, filtered)
- `POST /api/questions/bulk-delete` - Bulk delete questions
- `GET /api/questions/document/:documentId` - Get questions by document
- `POST /api/questions/generate/:documentId` - Generate questions
- `GET /api/questions/:id` - Get question by ID
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/validate` - Validate user answer

### RAG/Chat

- `POST /api/rag/general-chat` - General chat (no auth required)
- `POST /api/rag/chat` - Chat with multiple documents
- `POST /api/rag/chat/:documentId` - Chat with specific document

## Key Optimizations

### Serverless Environment

- Database connection caching
- Optimized Tesseract.js configuration for CDN usage
- Temporary file cleanup for Vercel environment
- Reduced cold start times

### AI Integration

- Vercel AI SDK v5 with structured outputs
- Google Gemini integration for RAG and question generation
- Streaming responses for better UX
- Type-safe AI responses with Zod schemas

### Security & Performance

- JWT token caching and versioning
- Enhanced error handling with proper HTTP status codes
- Input validation and sanitization
- Rate limiting ready (implement as needed)
- CORS configuration for production

### File Processing

- Multi-file upload support (max 5 files, 20MB each)
- Comprehensive file type validation
- OCR optimization for serverless
- Text extraction with error handling

## Deployment Notes

1. **Environment Variables**: Set all required env vars in Vercel dashboard
2. **MongoDB**: Use MongoDB Atlas for best performance
3. **API Keys**: Secure your Gemini API key
4. **CORS**: Update CORS origins for your frontend domain
5. **Memory**: Function configured for 50MB max size
6. **Timeout**: 30-second timeout for file processing operations

## Error Handling

The API returns consistent error responses:

```json
{
  "status": "error",
  "message": "Descriptive error message"
}
```

In development, stack traces are included. In production, only user-friendly messages are shown.

## File Size Limits

- Maximum file size: 20MB per file
- Maximum files per upload: 5
- Supported formats: PDF, DOCX, TXT, PNG, JPG, JPEG, BMP, TIFF

## Database Indexes

Optimized indexes for:

- User queries and authentication
- Document searches and filtering
- Question retrieval and filtering
- Performance monitoring

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token versioning for invalidation
- Account lockout after failed attempts
- Input validation and sanitization
- SQL injection prevention
- XSS protection
