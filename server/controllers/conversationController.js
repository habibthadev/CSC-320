
import Conversation from "../models/conversationModel.js";
import { catchAsync } from "../utils/catch-async.js";
import AppError from "../utils/app-error.js";

export const createConversation = catchAsync(async (req, res, next) => {
  const { documentId, message } = req.body;

  if (!documentId || !message) {
    return next(
      new AppError("Document ID and initial message are required", 400)
    );
  }

  // Find the document
  const document = await Document.findById(documentId);

  if (!document) {
    return next(new AppError("No document found with that ID", 404));
  }

  // Check if user has access to the document
  const isOwner = document.owner._id.toString() === req.user._id.toString();
  const isShared = document.shared.some(
    (id) => id.toString() === req.user._id.toString()
  );

  if (!isOwner && !isShared) {
    return next(
      new AppError("You do not have permission to access this document", 403)
    );
  }

  // Generate AI response based on the document content and user's message
  const prompt = `
    You are an AI assistant that helps users understand documents.
    
    Document Content:
    ${document.extractedText}
    
    The user is asking:
    ${message}
    
    Please provide a helpful response based on the document content.
  `;

  const aiResponse = await AiResponse(prompt);

  // Create a new conversation
  const conversation = await Conversation.create({
    user: req.user._id,
    document: documentId,
    title: `Conversation about ${document.name}`,
    messages: [
      {
        role: "user",
        content: message,
      },
      {
        role: "assistant",
        content: aiResponse,
      },
    ],
  });

  res.status(201).json({
    status: "success",
    data: {
      conversation,
    },
  });
});

export const continueConversation = catchAsync(async (req, res, next) => {
  const { message } = req.body;
  const conversationId = req.params.id;

  if (!message) {
    return next(new AppError("Message is required", 400));
  }

  // Find the conversation
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return next(new AppError("No conversation found with that ID", 404));
  }

  // Check if the user owns this conversation
  if (conversation.user.toString() !== req.user._id.toString()) {
    return next(
      new AppError(
        "You do not have permission to access this conversation",
        403
      )
    );
  }

  // Find the document
  const document = await Document.findById(conversation.document);

  if (!document) {
    return next(new AppError("The associated document no longer exists", 404));
  }

  // Build conversation history for context
  let conversationHistory = "";
  conversation.messages.forEach((msg) => {
    conversationHistory += `${msg.role === "user" ? "User" : "Assistant"}: ${
      msg.content
    }\n\n`;
  });

  // Generate AI response
  const prompt = `
    You are an AI assistant that helps users understand documents.
    
    Document Content:
    ${document.extractedText}
    
    Previous conversation:
    ${conversationHistory}
    
    The user is now asking:
    ${message}
    
    Please provide a helpful response based on the document content and conversation history.
  `;

  const aiResponse = await AiResponse(prompt);

  // Add the new messages to the conversation
  conversation.messages.push(
    {
      role: "user",
      content: message,
    },
    {
      role: "assistant",
      content: aiResponse,
    }
  );

  // Save the updated conversation
  await conversation.save();

  res.status(200).json({
    status: "success",
    data: {
      message: aiResponse,
      conversation,
    },
  });
});

export const getUserConversations = catchAsync(async (req, res, next) => {
  // Find all conversations for the current user
  const conversations = await Conversation.find({ user: req.user._id })
    .populate({
      path: "document",
      select: "name type",
    })
    .sort("-updatedAt");

  res.status(200).json({
    status: "success",
    results: conversations.length,
    data: {
      conversations,
    },
  });
});

export const getConversation = catchAsync(async (req, res, next) => {
  const conversationId = req.params.id;

  // Find the conversation
  const conversation = await Conversation.findById(conversationId).populate({
    path: "document",
    select: "name type extractedText",
  });

  if (!conversation) {
    return next(new AppError("No conversation found with that ID", 404));
  }

  // Check if the user owns this conversation
  if (conversation.user.toString() !== req.user._id.toString()) {
    return next(
      new AppError(
        "You do not have permission to access this conversation",
        403
      )
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      conversation,
    },
  });
});

export const deleteConversation = catchAsync(async (req, res, next) => {
  const conversationId = req.params.id;

  // Find the conversation
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return next(new AppError("No conversation found with that ID", 404));
  }

  // Check if the user owns this conversation
  if (conversation.user.toString() !== req.user._id.toString()) {
    return next(
      new AppError(
        "You do not have permission to delete this conversation",
        403
      )
    );
  }

  // Delete the conversation
  await Conversation.findByIdAndDelete(conversationId);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
