-- CreateTable
CREATE TABLE "ResumeDetail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "location" TEXT,
    "resumeMail" TEXT,
    "resumePhone" INTEGER,
    "socialLinkId" TEXT,
    "jobTitle" TEXT,
    "jobSector" TEXT,
    "education" TEXT,
    "passOutYear" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "totalMinutes" INTEGER NOT NULL DEFAULT 0,
    "averageScore" INTEGER NOT NULL DEFAULT 0,
    "commScore" INTEGER NOT NULL DEFAULT 0,
    "totalFillers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aiProvider" TEXT NOT NULL DEFAULT 'CLAUDE',
    "aiSessionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "lastMessageAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chatId" TEXT NOT NULL,
    "relatedInterviewId" TEXT,
    CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "mode" TEXT NOT NULL DEFAULT 'VOICE',
    "modelUsed" TEXT NOT NULL DEFAULT 'Claude',
    "userId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "tutorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "Interview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Interview_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "InterviewPackage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Interview_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterviewPackage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "estimatedMin" INTEGER NOT NULL,
    "numQuestions" INTEGER NOT NULL,
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Tutor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "traits" JSONB NOT NULL,
    "avgScore" INTEGER NOT NULL,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Transcript" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order" INTEGER NOT NULL,
    "speakerRole" TEXT NOT NULL,
    "speakerName" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interviewId" TEXT NOT NULL,
    CONSTRAINT "Transcript_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "fileUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interviewId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overallScore" INTEGER NOT NULL,
    "performanceLabel" TEXT NOT NULL,
    "commScore" INTEGER NOT NULL,
    "techScore" INTEGER NOT NULL,
    "problemSolveScore" INTEGER NOT NULL,
    "confidenceScore" INTEGER NOT NULL,
    "wordsSpoken" INTEGER NOT NULL,
    "turnsTaken" INTEGER NOT NULL,
    "totalFillerCount" INTEGER NOT NULL,
    "strengths" JSONB NOT NULL,
    "weaknesses" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    CONSTRAINT "Analysis_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestionFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "feedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interviewId" TEXT NOT NULL,
    CONSTRAINT "QuestionFeedback_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FillerWord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "word" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "impact" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "analysisId" TEXT NOT NULL,
    CONSTRAINT "FillerWord_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "userInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_ChatContext" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ChatContext_A_fkey" FOREIGN KEY ("A") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ChatContext_B_fkey" FOREIGN KEY ("B") REFERENCES "Note" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_InterviewContext" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_InterviewContext_A_fkey" FOREIGN KEY ("A") REFERENCES "Interview" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_InterviewContext_B_fkey" FOREIGN KEY ("B") REFERENCES "Note" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_health" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'ok',
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_health" ("checkedAt", "id", "status") SELECT "checkedAt", "id", "status" FROM "health";
DROP TABLE "health";
ALTER TABLE "new_health" RENAME TO "health";
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_users" ("createdAt", "email", "id", "name", "updatedAt") SELECT "createdAt", "email", "id", "name", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "UserStats_userId_key" ON "UserStats"("userId");

-- CreateIndex
CREATE INDEX "Interview_userId_idx" ON "Interview"("userId");

-- CreateIndex
CREATE INDEX "Interview_packageId_idx" ON "Interview"("packageId");

-- CreateIndex
CREATE INDEX "Interview_tutorId_idx" ON "Interview"("tutorId");

-- CreateIndex
CREATE INDEX "Transcript_interviewId_idx" ON "Transcript"("interviewId");

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_interviewId_key" ON "Analysis"("interviewId");

-- CreateIndex
CREATE INDEX "QuestionFeedback_interviewId_idx" ON "QuestionFeedback"("interviewId");

-- CreateIndex
CREATE INDEX "FillerWord_analysisId_idx" ON "FillerWord"("analysisId");

-- CreateIndex
CREATE UNIQUE INDEX "_ChatContext_AB_unique" ON "_ChatContext"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatContext_B_index" ON "_ChatContext"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_InterviewContext_AB_unique" ON "_InterviewContext"("A", "B");

-- CreateIndex
CREATE INDEX "_InterviewContext_B_index" ON "_InterviewContext"("B");
