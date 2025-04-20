import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "A question must have text"],
    },
    difficulty: {
      type: String,
      required: [true, "A question must have a difficulty level"],
      enum: ["easy", "medium", "hard"],
    },
    correctAnswer: {
      type: String,
      required: [true, "A question must have a correct answer"],
    },
    document: {
      type: mongoose.Schema.ObjectId,
      ref: "Document",
      required: [true, "A question must be related to a document"],
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A question must have a creator"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Question = mongoose.model("Question", questionSchema);

export default Question;
