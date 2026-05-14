import { Router } from 'express';
import {
  listConversations,
  createConversation,
  getConversation,
  updateConversation,
  deleteConversation,
  addMessage,
  createInterviewPlan,
} from '../controller/conversation.controller.js';

export const conversationRouter = Router();

conversationRouter.get('/', listConversations);
conversationRouter.post('/', createConversation);
conversationRouter.get('/:conversationId', getConversation);
conversationRouter.patch('/:conversationId', updateConversation);
conversationRouter.delete('/:conversationId', deleteConversation);

conversationRouter.post('/:conversationId/messages', addMessage);
conversationRouter.post('/:conversationId/interview-plan', createInterviewPlan);
