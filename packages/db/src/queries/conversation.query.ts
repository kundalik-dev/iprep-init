import { prisma } from '../prisma.js';

const LOCAL_USER_ID = 'local_user';

export const ConversationQuery = {
  async listConversations() {
    return prisma.chat.findMany({
      where: { userId: LOCAL_USER_ID },
      orderBy: { lastMessageAt: 'desc' },
      select: {
        id: true,
        title: true,
        lastMessageAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async createConversation(input: { title: string; documentIds?: string[] }) {
    const data: any = {
      title: input.title,
      userId: LOCAL_USER_ID,
    };

    if (input.documentIds && input.documentIds.length > 0) {
      data.usedNotes = {
        connect: input.documentIds.map((id) => ({ id })),
      };
    }

    return prisma.chat.create({
      data,
      include: {
        usedNotes: true,
      },
    });
  },

  async getConversation(id: string) {
    return prisma.chat.findUnique({
      where: {
        id,
        userId: LOCAL_USER_ID,
      },
      include: {
        messages: {
          orderBy: { sentAt: 'asc' },
        },
        usedNotes: true,
      },
    });
  },

  async updateConversation(id: string, data: { title?: string }) {
    return prisma.chat.update({
      where: {
        id,
        userId: LOCAL_USER_ID,
      },
      data,
    });
  },

  async deleteConversation(id: string) {
    // Delete messages first to maintain referential integrity if cascade is not set
    await prisma.message.deleteMany({
      where: { chatId: id },
    });

    return prisma.chat.delete({
      where: {
        id,
        userId: LOCAL_USER_ID,
      },
    });
  },

  async addMessage(chatId: string, input: { role: 'AI' | 'USER'; content: string; relatedInterviewId?: string }) {
    // Ensure chat exists and belongs to user
    const chat = await prisma.chat.findUnique({
      where: { id: chatId, userId: LOCAL_USER_ID },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    const message = await prisma.message.create({
      data: {
        role: input.role,
        content: input.content,
        chatId: chatId,
        relatedInterviewId: input.relatedInterviewId,
      },
    });

    // Update lastMessageAt on the chat
    await prisma.chat.update({
      where: { id: chatId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  },
};
