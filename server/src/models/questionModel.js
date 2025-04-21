import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);

export default Question;
