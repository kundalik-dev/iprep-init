import type { RequestHandler } from 'express';
import { InterviewQuery } from '@iprep/db';
import { ApiError, ApiResponse, StatusCodes, asyncHandler } from '../utils/index.js';

const INTERVIEW_STATUSES = new Set(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);
const INTERVIEW_MODES = new Set(['VOICE', 'CHAT', 'VIDEO']);
const INTERVIEW_TYPES = new Set([
  'BEHAVIORAL',
  'TECHNICAL',
  'DSA',
  'HR_ROUND',
  'PRODUCT_MANAGER',
  'SYSTEM_DESIGN',
]);
const DIFFICULTIES = new Set(['EASY', 'MEDIUM', 'HARD', 'EXPERT']);

// Reads a required route parameter as a trimmed string.
function requiredParam(value: string | string[] | undefined, name: string) {
  if (typeof value === 'string' && value.trim()) return value.trim();
  throw new ApiError(StatusCodes.BAD_REQUEST, `${name} is required`);
}

// Reads a positive integer query value with a safe fallback.
function positiveInt(value: unknown, fallback: number, max = 100) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

// Normalizes external interview type names into the current Prisma enum names.
function normalizeType(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const normalized = value.trim().toUpperCase();
  const mapped = normalized === 'HR' ? 'HR_ROUND' : normalized;
  return INTERVIEW_TYPES.has(mapped) ? mapped : undefined;
}

// Normalizes interview statuses while treating ABANDONED as CANCELLED for the current schema.
function normalizeStatus(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const normalized = value.trim().toUpperCase();
  const mapped = normalized === 'ABANDONED' ? 'CANCELLED' : normalized;
  return INTERVIEW_STATUSES.has(mapped) ? mapped : undefined;
}

// Normalizes requested interview modes into the current Prisma enum names.
function normalizeMode(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const normalized = value.trim().toUpperCase();
  return INTERVIEW_MODES.has(normalized) ? normalized : undefined;
}

// Normalizes requested difficulty names into the current Prisma enum names.
function normalizeDifficulty(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const normalized = value.trim().toUpperCase();
  return DIFFICULTIES.has(normalized) ? normalized : undefined;
}

// Converts API document id lists into clean string arrays.
function readStringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : undefined;
}

// Builds a stable package slug from the current package title/type.
function packageSlug(interviewPackage: { id: string; title: string; type: string }) {
  if (interviewPackage.id.startsWith('pkg_')) return interviewPackage.id.replace(/^pkg_/, '');
  return interviewPackage.type.toLowerCase();
}

// Builds a stable tutor slug from the current tutor id.
function tutorSlug(tutor: { id: string } | null) {
  return tutor?.id.startsWith('tutor_') ? tutor.id.replace(/^tutor_/, '') : null;
}

// Maps an interview record to the list-card API shape.
function mapInterviewSummary(interview: any) {
  const durationSec = InterviewQuery.durationSec(interview);

  return {
    id: interview.id,
    packageSlug: packageSlug(interview.package),
    packageName: interview.package.title,
    tutorSlug: tutorSlug(interview.tutor),
    tutorName: interview.tutor?.name ?? null,
    status: interview.status,
    mode: interview.mode,
    startedAt: interview.startedAt,
    endedAt: interview.completedAt,
    durationSec,
    score: interview.analysis?.overallScore ?? null,
    analysisId: interview.analysis?.id ?? null,
    hasRecording: false,
    hasTranscript: interview.transcripts?.length > 0,
    createdAt: interview.createdAt,
    updatedAt: interview.updatedAt,
  };
}

// Maps an interview record to the detailed API shape.
function mapInterviewDetail(interview: any) {
  return {
    ...mapInterviewSummary(interview),
    package: interview.package,
    tutor: interview.tutor,
    usedNotes: interview.usedNotes ?? [],
    transcripts: (interview.transcripts ?? []).map(mapTranscriptTurn),
    analysis: interview.analysis ? mapAnalysis(interview.analysis) : null,
    questionFeedback: interview.questionFeedback ?? [],
  };
}

// Maps transcript rows into the API transcript turn shape.
function mapTranscriptTurn(turn: any) {
  return {
    id: turn.id,
    speaker: turn.speakerRole === 'AI' ? 'ai' : 'user',
    speakerName: turn.speakerName,
    text: turn.text,
    timestampSec: null,
    createdAt: turn.createdAt,
  };
}

// Maps analysis rows into the API analysis report shape.
function mapAnalysis(analysis: any) {
  return {
    id: analysis.id,
    interviewId: analysis.interviewId,
    provider: null,
    status: 'COMPLETED',
    scores: {
      communication: analysis.commScore,
      technical: analysis.techScore,
      problemSolving: analysis.problemSolveScore,
      confidence: analysis.confidenceScore,
      overall: analysis.overallScore,
    },
    strengths: analysis.strengths,
    improvements: analysis.weaknesses,
    recommendations: analysis.recommendations,
    answerFeedback: [],
    communicationAnalysis: {
      wordsSpoken: analysis.wordsSpoken,
      turnsTaken: analysis.turnsTaken,
      totalFillerCount: analysis.totalFillerCount,
      fillerWords: analysis.fillerWords ?? [],
    },
    reportMarkdown: renderAnalysisMarkdown(analysis),
    generatedAt: analysis.updatedAt,
  };
}

// Renders a lightweight Markdown report from stored analysis scores and feedback.
function renderAnalysisMarkdown(analysis: any) {
  const strengths = Array.isArray(analysis.strengths) ? analysis.strengths : [];
  const weaknesses = Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [];
  const recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];

  return [
    '# Interview Analysis',
    '',
    `Overall score: ${analysis.overallScore}`,
    `Performance: ${analysis.performanceLabel}`,
    '',
    '## Strengths',
    ...strengths.map((item: unknown) => `- ${String(item)}`),
    '',
    '## Improvements',
    ...weaknesses.map((item: unknown) => `- ${String(item)}`),
    '',
    '## Recommendations',
    ...recommendations.map((item: unknown) => `- ${String(item)}`),
    '',
  ].join('\n');
}

// Lists interview sessions for dashboard and history views.
export const listInterviews: RequestHandler = asyncHandler(async (req, res) => {
  const page = positiveInt(req.query.page, 1);
  const pageSize = positiveInt(req.query.pageSize, 20);
  const result = await InterviewQuery.listInterviews({
    status: normalizeStatus(req.query.status) as any,
    type: normalizeType(req.query.type) as any,
    mode: normalizeMode(req.query.mode) as any,
    q: typeof req.query.q === 'string' ? req.query.q : undefined,
    page,
    pageSize,
  });

  res.status(StatusCodes.OK).json({
    data: result.interviews.map(mapInterviewSummary),
    meta: { total: result.total, page, pageSize },
  });
});

// Creates a draft interview from a template or AI-guided setup payload.
export const createInterview: RequestHandler = asyncHandler(async (req, res) => {
  const interview = await InterviewQuery.createInterview({
    source: typeof req.body?.source === 'string' ? req.body.source : undefined,
    packageSlug:
      typeof req.body?.packageSlug === 'string' ? req.body.packageSlug : undefined,
    difficulty: normalizeDifficulty(req.body?.difficulty) as any,
    durationMin:
      typeof req.body?.durationMin === 'number' ? req.body.durationMin : undefined,
    mode: normalizeMode(req.body?.mode) as any,
    tutorSlug: typeof req.body?.tutorSlug === 'string' ? req.body.tutorSlug : null,
    contextDocumentIds: readStringList(req.body?.contextDocumentIds),
    generatedPlan:
      typeof req.body?.generatedPlan === 'object' && req.body.generatedPlan !== null
        ? req.body.generatedPlan
        : undefined,
  });

  res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, mapInterviewSummary(interview), 'Interview created'));
});

// Reads one interview session with transcript and analysis details.
export const getInterview: RequestHandler = asyncHandler(async (req, res) => {
  const interviewId = requiredParam(req.params.interviewId, 'interviewId');
  const interview = await InterviewQuery.getInterview(interviewId);

  if (!interview) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'interview not found');
  }

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, mapInterviewDetail(interview), 'Interview fetched'));
});

// Updates editable draft setup fields before an interview starts.
export const updateInterview: RequestHandler = asyncHandler(async (req, res) => {
  const interviewId = requiredParam(req.params.interviewId, 'interviewId');
  const interview = await InterviewQuery.updateInterview(interviewId, {
    difficulty: normalizeDifficulty(req.body?.difficulty) as any,
    durationMin:
      typeof req.body?.durationMin === 'number' ? req.body.durationMin : undefined,
    mode: normalizeMode(req.body?.mode) as any,
    tutorSlug: req.body?.tutorSlug !== undefined ? String(req.body.tutorSlug) : undefined,
    contextDocumentIds: readStringList(req.body?.contextDocumentIds),
  });

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, mapInterviewDetail(interview), 'Interview updated'));
});

// Starts a draft interview and records the start time.
export const startInterview: RequestHandler = asyncHandler(async (req, res) => {
  const interview = await InterviewQuery.startInterview(
    requiredParam(req.params.interviewId, 'interviewId'),
  );

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, mapInterviewSummary(interview), 'Interview started'));
});

// Ends an active interview and optionally creates a placeholder analysis report.
export const endInterview: RequestHandler = asyncHandler(async (req, res) => {
  const interviewId = requiredParam(req.params.interviewId, 'interviewId');
  const interview = await InterviewQuery.endInterview(interviewId);
  const autoAnalyze = req.body?.autoAnalyze !== false;
  const analysis = autoAnalyze ? await InterviewQuery.upsertAnalysis(interviewId) : null;

  res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        ...mapInterviewSummary(interview),
        analysisJobId: analysis ? `job_analysis_${analysis.id}` : null,
      },
      'Interview ended',
    ),
  );
});

// Cancels an interview without deleting the local record.
export const cancelInterview: RequestHandler = asyncHandler(async (req, res) => {
  const interview = await InterviewQuery.cancelInterview(
    requiredParam(req.params.interviewId, 'interviewId'),
  );

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, mapInterviewSummary(interview), 'Interview cancelled'));
});

// Deletes an interview session and related local data rows.
export const deleteInterview: RequestHandler = asyncHandler(async (req, res) => {
  const interview = await InterviewQuery.deleteInterview(
    requiredParam(req.params.interviewId, 'interviewId'),
  );

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, { id: interview.id }, 'Interview deleted'));
});

// Reads transcript turns for an interview.
export const getTranscript: RequestHandler = asyncHandler(async (req, res) => {
  const turns = await InterviewQuery.listTranscript(
    requiredParam(req.params.interviewId, 'interviewId'),
  );

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, turns.map(mapTranscriptTurn), 'Transcript fetched'));
});

// Appends transcript turns to an interview.
export const appendTranscript: RequestHandler = asyncHandler(async (req, res) => {
  const interviewId = requiredParam(req.params.interviewId, 'interviewId');
  const rawTurns = Array.isArray(req.body?.turns) ? req.body.turns : [];

  if (rawTurns.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'turns are required');
  }

  const turns = rawTurns.map((turn: Record<string, unknown>) => ({
    speaker: String(turn.speaker ?? '').toUpperCase() === 'AI' ? 'AI' : 'USER',
    speakerName: turn.speakerName ? String(turn.speakerName) : undefined,
    text: String(turn.text ?? '').trim(),
    timestampSec:
      typeof turn.timestampSec === 'number' ? turn.timestampSec : undefined,
  }));

  if (turns.some((turn: { text: string }) => !turn.text)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'each transcript turn needs text');
  }

  const savedTurns = await InterviewQuery.appendTranscript(interviewId, turns as any);

  res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, savedTurns.map(mapTranscriptTurn), 'Transcript updated'));
});

// Returns recording metadata for future voice interview support.
export const getRecording: RequestHandler = asyncHandler(async (req, res) => {
  const interviewId = requiredParam(req.params.interviewId, 'interviewId');

  res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      { interviewId, hasRecording: false, recordingPath: null, durationSec: null },
      'Recording metadata fetched',
    ),
  );
});

// Returns a clear placeholder while recording downloads are not implemented.
export const downloadRecording: RequestHandler = asyncHandler(async (_req, _res) => {
  throw new ApiError(StatusCodes.NOT_FOUND, 'recording download is not available yet');
});

// Downloads transcript text as a simple Markdown/plain text export.
export const downloadTranscript: RequestHandler = asyncHandler(async (req, res) => {
  const turns = await InterviewQuery.listTranscript(
    requiredParam(req.params.interviewId, 'interviewId'),
  );
  const body = turns
    .map((turn: { speakerName: string; text: string }) => `[${turn.speakerName}] ${turn.text}`)
    .join('\n\n');

  res.setHeader('content-type', 'text/markdown; charset=utf-8');
  res.setHeader('content-disposition', 'attachment; filename="interview-transcript.md"');
  res.status(StatusCodes.OK).send(body);
});

// Creates or reruns a placeholder analysis for an interview.
export const triggerAnalysis: RequestHandler = asyncHandler(async (req, res) => {
  const analysis = await InterviewQuery.upsertAnalysis(
    requiredParam(req.params.interviewId, 'interviewId'),
  );

  res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, mapAnalysis(analysis), 'Analysis generated'));
});

// Reads the latest analysis attached to one interview.
export const getInterviewAnalysis: RequestHandler = asyncHandler(async (req, res) => {
  const analysis = await InterviewQuery.getAnalysisForInterview(
    requiredParam(req.params.interviewId, 'interviewId'),
  );

  if (!analysis) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'analysis not found');
  }

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, mapAnalysis(analysis), 'Analysis fetched'));
});

// Reads an analysis report by its id.
export const getAnalysisById: RequestHandler = asyncHandler(async (req, res) => {
  const analysis = await InterviewQuery.getAnalysis(
    requiredParam(req.params.analysisId, 'analysisId'),
  );

  if (!analysis) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'analysis not found');
  }

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, mapAnalysis(analysis), 'Analysis fetched'));
});

// Downloads an analysis report as Markdown.
export const downloadAnalysis: RequestHandler = asyncHandler(async (req, res) => {
  const analysis = await InterviewQuery.getAnalysis(
    requiredParam(req.params.analysisId, 'analysisId'),
  );

  if (!analysis) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'analysis not found');
  }

  res.setHeader('content-type', 'text/markdown; charset=utf-8');
  res.setHeader('content-disposition', 'attachment; filename="interview-analysis.md"');
  res.status(StatusCodes.OK).send(renderAnalysisMarkdown(analysis));
});

// Returns communication metrics for a single interview analysis.
export const getInterviewCommunication: RequestHandler = asyncHandler(async (req, res) => {
  const analysis = await InterviewQuery.getAnalysisForInterview(
    requiredParam(req.params.interviewId, 'interviewId'),
  );

  res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      analysis
        ? mapAnalysis(analysis).communicationAnalysis
        : { wordsSpoken: 0, turnsTaken: 0, totalFillerCount: 0, fillerWords: [] },
      'Interview communication fetched',
    ),
  );
});
