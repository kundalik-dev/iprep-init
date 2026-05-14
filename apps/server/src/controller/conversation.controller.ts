import type { RequestHandler } from 'express';
import { ConversationQuery } from '@iprep/db';
import { ApiError, ApiResponse, StatusCodes, asyncHandler } from '../utils/index.js';

export const listConversations: RequestHandler = asyncHandler(async (req, res) => {
  const conversations = await ConversationQuery.listConversations();
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, conversations, 'Conversations fetched successfully'));
});

export const createConversation: RequestHandler = asyncHandler(async (req, res) => {
  const title = String(req.body?.title ?? 'New Conversation');
  const documentIds = req.body?.documentIds;

  const conversation = await ConversationQuery.createConversation({ title, documentIds });
  res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, conversation, 'Conversation created successfully'));
});

export const getConversation: RequestHandler = asyncHandler(async (req, res) => {
  const conversationId = req.params.conversationId;
  const conversation = await ConversationQuery.getConversation(conversationId);

  if (!conversation) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found');
  }

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, conversation, 'Conversation fetched successfully'));
});

export const updateConversation: RequestHandler = asyncHandler(async (req, res) => {
  const conversationId = req.params.conversationId;
  const title = req.body?.title;

  const conversation = await ConversationQuery.updateConversation(conversationId, { title });

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, conversation, 'Conversation updated successfully'));
});

export const deleteConversation: RequestHandler = asyncHandler(async (req, res) => {
  const conversationId = req.params.conversationId;
  
  await ConversationQuery.deleteConversation(conversationId);

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, { id: conversationId }, 'Conversation deleted successfully'));
});

export const addMessage: RequestHandler = asyncHandler(async (req, res) => {
  const conversationId = req.params.conversationId;
  const { text, contextDocumentIds } = req.body;

  if (!text) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'text is required');
  }

  // Save the user message
  const userMessage = await ConversationQuery.addMessage(conversationId, {
    role: 'USER',
    content: text,
  });

  // Mock AI response logic for now (later, hook into AI provider)
  const aiResponseContent = `This is a mock AI response to: "${text}"`;
  const aiMessage = await ConversationQuery.addMessage(conversationId, {
    role: 'AI',
    content: aiResponseContent,
  });

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, { userMessage, aiMessage }, 'Message added and AI responded'));
});

export const createInterviewPlan: RequestHandler = asyncHandler(async (req, res) => {
  const conversationId = req.params.conversationId;
  
  // Dummy logic: return a mock plan based on brainstorm notes
  const plan = {
    id: `plan_${Date.now()}`,
    type: "BEHAVIORAL",
    difficulty: "MEDIUM",
    durationMin: 25,
    mode: "VOICE",
    tutorStyle: "supportive",
    topics: ["leadership", "conflict", "ownership"],
    questionPlan: []
  };

  res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, plan, 'Interview plan generated successfully'));
});
