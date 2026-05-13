import { prisma } from '../prisma.js';

const LOCAL_USER_ID = 'local_user';

export interface CreateDocumentInput {
  title: string;
  content?: string | null;
  fileUrl?: string | null;
}

async function ensureLocalUser() {
  return prisma.user.upsert({
    where: { id: LOCAL_USER_ID },
    update: {},
    create: {
      id: LOCAL_USER_ID,
      name: 'iPrep User',
      onboardingStep: 'PROFILE',
      isOnboardingComplete: false,
    },
  });
}

export const DocumentQuery = {
  async listDocuments() {
    const user = await ensureLocalUser();

    return prisma.note.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async createDocument(input: CreateDocumentInput) {
    const user = await ensureLocalUser();

    return prisma.note.create({
      data: {
        title: input.title,
        content: input.content ?? null,
        fileUrl: input.fileUrl ?? null,
        userId: user.id,
      },
    });
  },

  async updateDocumentFileUrl(documentId: string, fileUrl: string) {
    const user = await ensureLocalUser();

    return prisma.note.update({
      where: {
        id: documentId,
        userId: user.id,
      },
      data: {
        fileUrl,
      },
    });
  },
};

export default DocumentQuery;
