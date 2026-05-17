import { prisma } from '../prisma.js';
import type { Difficulty, InterviewMode, InterviewStatus, InterviewType, Speaker } from '../generated/prisma/enums.js';

const LOCAL_USER_ID = 'local_user';

const PACKAGE_BY_SLUG: Record<
  string,
  {
    id: string;
    title: string;
    description: string;
    icon: string;
    type: InterviewType;
    difficulty: Difficulty;
    estimatedMin: number;
    numQuestions: number;
  }
> = {
  behavioral: {
    id: 'pkg_behavioral',
    title: 'Behavioral Interview',
    description: 'Practice STAR stories, leadership, conflict, and ownership.',
    icon: 'message-circle',
    type: 'BEHAVIORAL',
    difficulty: 'MEDIUM',
    estimatedMin: 25,
    numQuestions: 8,
  },
  hr: {
    id: 'pkg_hr',
    title: 'HR Round',
    description: 'Practice common HR screening and culture-fit questions.',
    icon: 'users',
    type: 'HR_ROUND',
    difficulty: 'MEDIUM',
    estimatedMin: 20,
    numQuestions: 8,
  },
  technical: {
    id: 'pkg_technical',
    title: 'Technical Interview',
    description: 'Practice role-specific technical depth and tradeoff questions.',
    icon: 'code',
    type: 'TECHNICAL',
    difficulty: 'MEDIUM',
    estimatedMin: 30,
    numQuestions: 10,
  },
  dsa: {
    id: 'pkg_dsa',
    title: 'DSA Interview',
    description: 'Practice data structures, algorithms, and problem solving.',
    icon: 'braces',
    type: 'DSA',
    difficulty: 'MEDIUM',
    estimatedMin: 45,
    numQuestions: 3,
  },
  system_design: {
    id: 'pkg_system_design',
    title: 'System Design',
    description: 'Practice architecture, scaling, reliability, and tradeoffs.',
    icon: 'network',
    type: 'SYSTEM_DESIGN',
    difficulty: 'HARD',
    estimatedMin: 45,
    numQuestions: 5,
  },
};

const TUTOR_BY_SLUG: Record<
  string,
  {
    id: string;
    name: string;
    initials: string;
    specialty: string;
    bio: string;
    traits: string[];
  }
> = {
  priya: {
    id: 'tutor_priya',
    name: 'Priya',
    initials: 'PR',
    specialty: 'Supportive behavioral coaching',
    bio: 'A calm interviewer who helps candidates structure answers clearly.',
    traits: ['Supportive', 'Structured', 'Warm'],
  },
  arjun: {
    id: 'tutor_arjun',
    name: 'Arjun',
    initials: 'AJ',
    specialty: 'Technical depth and tradeoffs',
    bio: 'A direct technical interviewer focused on clarity and reasoning.',
    traits: ['Technical', 'Direct', 'Analytical'],
  },
};

export interface ListInterviewsInput {
  status?: InterviewStatus;
  type?: InterviewType;
  mode?: InterviewMode;
  q?: string;
  page: number;
  pageSize: number;
}

export interface CreateInterviewInput {
  source?: string;
  packageSlug?: string;
  difficulty?: Difficulty;
  durationMin?: number;
  mode?: InterviewMode;
  tutorSlug?: string | null;
  contextDocumentIds?: string[];
  generatedPlan?: Record<string, unknown>;
}

export interface UpdateInterviewInput {
  difficulty?: Difficulty;
  durationMin?: number;
  mode?: InterviewMode;
  tutorSlug?: string | null;
  contextDocumentIds?: string[];
}

export interface TranscriptTurnInput {
  speaker: Speaker;
  speakerName?: string;
  text: string;
  timestampSec?: number;
}

// Makes sure the local placeholder user exists before interview records are written.
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

// Converts package slugs from the API into seeded package rows.
async function ensurePackage(slug?: string, fallbackDifficulty?: Difficulty, fallbackDurationMin?: number) {
  const key = slug?.toLowerCase() ?? 'behavioral';
  const template = PACKAGE_BY_SLUG[key] ?? PACKAGE_BY_SLUG.behavioral;

  return prisma.interviewPackage.upsert({
    where: { id: template.id },
    update: {
      difficulty: fallbackDifficulty ?? template.difficulty,
      estimatedMin: fallbackDurationMin ?? template.estimatedMin,
    },
    create: {
      ...template,
      difficulty: fallbackDifficulty ?? template.difficulty,
      estimatedMin: fallbackDurationMin ?? template.estimatedMin,
    },
  });
}

// Converts tutor slugs from the API into seeded tutor rows when provided.
async function ensureTutor(slug?: string | null) {
  if (!slug) return null;
  const template = TUTOR_BY_SLUG[slug.toLowerCase()] ?? TUTOR_BY_SLUG.priya;

  return prisma.tutor.upsert({
    where: { id: template.id },
    update: {},
    create: {
      ...template,
      traits: template.traits,
      avgScore: 0,
      totalSessions: 0,
      isPro: false,
    },
  });
}

// Builds the document connection list for interview context notes.
function connectNotes(documentIds?: string[]) {
  return documentIds && documentIds.length > 0
    ? { connect: documentIds.map((id) => ({ id })) }
    : undefined;
}

// Counts transcript turns and creates a lightweight duration estimate.
function durationSec(interview: { startedAt: Date | null; completedAt: Date | null }) {
  if (!interview.startedAt || !interview.completedAt) return null;
  return Math.max(0, Math.round((interview.completedAt.getTime() - interview.startedAt.getTime()) / 1000));
}

export const InterviewQuery = {
  // Lists interviews with simple filtering and pagination for dashboard/history screens.
  async listInterviews(input: ListInterviewsInput) {
    const user = await ensureLocalUser();
    const where = {
      userId: user.id,
      ...(input.status ? { status: input.status } : {}),
      ...(input.mode ? { mode: input.mode } : {}),
      ...(input.type ? { package: { type: input.type } } : {}),
      ...(input.q
        ? {
            OR: [
              { package: { title: { contains: input.q } } },
              { tutor: { name: { contains: input.q } } },
              { transcripts: { some: { text: { contains: input.q } } } },
            ],
          }
        : {}),
    };

    const [total, interviews] = await Promise.all([
      prisma.interview.count({ where }),
      prisma.interview.findMany({
        where,
        include: { package: true, tutor: true, analysis: true, transcripts: true },
        orderBy: { updatedAt: 'desc' },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
    ]);

    return { total, interviews };
  },

  // Creates a draft interview from a package slug or an AI-generated setup plan.
  async createInterview(input: CreateInterviewInput) {
    const user = await ensureLocalUser();
    const plan = input.generatedPlan ?? {};
    const packageSlug = input.packageSlug ?? String(plan.packageSlug ?? plan.type ?? 'behavioral').toLowerCase();
    const interviewPackage = await ensurePackage(packageSlug, input.difficulty, input.durationMin);
    const tutor = await ensureTutor(input.tutorSlug);

    return prisma.interview.create({
      data: {
        userId: user.id,
        packageId: interviewPackage.id,
        tutorId: tutor?.id ?? null,
        mode: input.mode ?? 'VOICE',
        status: 'DRAFT',
        usedNotes: connectNotes(input.contextDocumentIds),
      },
      include: { package: true, tutor: true, analysis: true, transcripts: true, usedNotes: true },
    });
  },

  // Reads one interview with all nested session details needed by the UI.
  async getInterview(interviewId: string) {
    const user = await ensureLocalUser();

    return prisma.interview.findFirst({
      where: { id: interviewId, userId: user.id },
      include: {
        package: true,
        tutor: true,
        transcripts: { orderBy: { order: 'asc' } },
        analysis: { include: { fillerWords: true } },
        questionFeedback: true,
        usedNotes: true,
      },
    });
  },

  // Updates draft setup details before an interview starts.
  async updateInterview(interviewId: string, input: UpdateInterviewInput) {
    await ensureLocalUser();
    const tutor = input.tutorSlug !== undefined ? await ensureTutor(input.tutorSlug) : undefined;

    return prisma.interview.update({
      where: { id: interviewId },
      data: {
        ...(input.mode ? { mode: input.mode } : {}),
        ...(tutor !== undefined ? { tutorId: tutor?.id ?? null } : {}),
        ...(input.contextDocumentIds
          ? { usedNotes: { set: [], ...connectNotes(input.contextDocumentIds) } }
          : {}),
      },
      include: { package: true, tutor: true, analysis: true, transcripts: true, usedNotes: true },
    });
  },

  // Moves a draft interview into the active in-progress state.
  async startInterview(interviewId: string) {
    return prisma.interview.update({
      where: { id: interviewId },
      data: { status: 'IN_PROGRESS', startedAt: new Date() },
      include: { package: true, tutor: true, analysis: true, transcripts: true },
    });
  },

  // Marks an interview complete and records when it ended.
  async endInterview(interviewId: string) {
    return prisma.interview.update({
      where: { id: interviewId },
      data: { status: 'COMPLETED', completedAt: new Date() },
      include: { package: true, tutor: true, analysis: true, transcripts: true },
    });
  },

  // Marks an interview as cancelled without deleting its local data.
  async cancelInterview(interviewId: string) {
    return prisma.interview.update({
      where: { id: interviewId },
      data: { status: 'CANCELLED', completedAt: new Date() },
      include: { package: true, tutor: true, analysis: true, transcripts: true },
    });
  },

  // Deletes an interview and cascades transcript/analysis data through Prisma relations.
  async deleteInterview(interviewId: string) {
    return prisma.interview.delete({ where: { id: interviewId } });
  },

  // Lists transcript turns in playback order for one interview.
  async listTranscript(interviewId: string) {
    return prisma.transcript.findMany({
      where: { interviewId },
      orderBy: { order: 'asc' },
    });
  },

  // Appends transcript turns to an interview using the next available order numbers.
  async appendTranscript(interviewId: string, turns: TranscriptTurnInput[]) {
    const lastTurn = await prisma.transcript.findFirst({
      where: { interviewId },
      orderBy: { order: 'desc' },
    });
    const startOrder = (lastTurn?.order ?? 0) + 1;

    await prisma.transcript.createMany({
      data: turns.map((turn, index) => ({
        interviewId,
        order: startOrder + index,
        speakerRole: turn.speaker,
        speakerName: turn.speakerName ?? (turn.speaker === 'AI' ? 'iPrep AI' : 'You'),
        text: turn.text,
        timestamp:
          turn.timestampSec !== undefined
            ? new Date(Date.now() + turn.timestampSec * 1000)
            : new Date(),
      })),
    });

    return this.listTranscript(interviewId);
  },

  // Creates or refreshes a placeholder analysis report for a completed interview.
  async upsertAnalysis(interviewId: string) {
    const transcriptCount = await prisma.transcript.count({ where: { interviewId } });

    return prisma.analysis.upsert({
      where: { interviewId },
      update: { turnsTaken: transcriptCount },
      create: {
        interviewId,
        overallScore: 0,
        performanceLabel: 'Pending Review',
        commScore: 0,
        techScore: 0,
        problemSolveScore: 0,
        confidenceScore: 0,
        wordsSpoken: 0,
        turnsTaken: transcriptCount,
        totalFillerCount: 0,
        strengths: [],
        weaknesses: [],
        recommendations: [],
      },
      include: { fillerWords: true, interview: { include: { package: true, tutor: true } } },
    });
  },

  // Reads the latest one-to-one analysis for an interview.
  async getAnalysisForInterview(interviewId: string) {
    return prisma.analysis.findUnique({
      where: { interviewId },
      include: { fillerWords: true, interview: { include: { package: true, tutor: true } } },
    });
  },

  // Reads an analysis report directly by analysis id.
  async getAnalysis(analysisId: string) {
    return prisma.analysis.findUnique({
      where: { id: analysisId },
      include: { fillerWords: true, interview: { include: { package: true, tutor: true } } },
    });
  },

  // Exposes a shared duration calculation for controllers that map API responses.
  durationSec,
};
