import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxLength: [200, "Title cannot exceed 200 characters"],
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "image/png",
        "image/jpg",
        "image/jpeg",
        "image/bmp",
        "image/tiff",
      ],
    },
    fileSize: {
      type: Number,
      required: true,
      min: [1, "File size must be greater than 0"],
    },
    storagePath: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      default: "",
    },
    wordCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    chunkCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    vectorized: {
      type: Boolean,
      default: false,
      index: true,
    },
    embeddingId: {
      type: String,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    processingStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "completed",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

documentSchema.index({ user: 1, createdAt: -1 });
documentSchema.index({ user: 1, title: 1 });
documentSchema.index({ user: 1, fileType: 1 });
documentSchema.index({ user: 1, vectorized: 1 });
documentSchema.index({ title: "text", summary: "text" });

documentSchema.virtual("sizeInMB").get(function () {
  return (this.fileSize / (1024 * 1024)).toFixed(2);
});

documentSchema.virtual("questions", {
  ref: "Question",
  localField: "_id",
  foreignField: "document",
});

documentSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await mongoose.model("Question").deleteMany({ document: this._id });
  }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;
