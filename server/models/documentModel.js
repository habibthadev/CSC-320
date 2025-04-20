import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A document must have a name"],
    },
    type: {
      type: String,
      required: [true, "A document must have a type"],
      enum: ["pdf", "image", "docx", "txt"],
    },
    fileKey: {
      type: String,
      required: [true, "A document must have a file key"],
    },
    fileUrl: String,
    extractedText: {
      type: String,
      required: [true, "A document must have extracted text"],
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A document must belong to a user"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    shared: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate
documentSchema.virtual("questions", {
  ref: "Question",
  foreignField: "document",
  localField: "_id",
});

// Document middleware
documentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "owner",
    select: "name email",
  });
  next();
});

const Document = mongoose.model("Document", documentSchema);

export default Document;
