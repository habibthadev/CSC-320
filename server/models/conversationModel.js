import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A conversation must belong to a user"],
  },
  document: {
    type: mongoose.Schema.ObjectId,
    ref: "Document",
    required: [true, "A conversation must be related to a document"],
  },
  title: {
    type: String,
    default: "New Conversation",
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on new messages
conversationSchema.pre("save", function (next) {
  if (this.isModified("messages")) {
    this.updatedAt = Date.now();
  }
  next();
});

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
