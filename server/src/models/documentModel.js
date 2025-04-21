import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please add a title"],
    },
    originalFileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    vectorized: {
      type: Boolean,
      default: false,
    },
    embeddingId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Create index on extracted text for text search capabilities
documentSchema.index({ extractedText: "text" });

const Document = mongoose.model("Document", documentSchema);

export default Document;
