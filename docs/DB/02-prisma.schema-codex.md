---
name: 02-prisma-schema-codex.md
description: This file is about prisma schema & its models
---

This file is about prisma schema

```prisma
// Unified Prisma Schema for iPrep — AI Interview Coach

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// --- USER & AUTH ---

model User {
  id            Int            @id @default(autoincrement())
  name          String
  email         String         @unique
  plan          Plan           @default(FREE)

  // Dashboard & Progress
  studyStreak   Int            @default(0)
  totalSessions Int            @default(0)
  darkMode      Boolean        @default(false)

  // Relations
  sessions      Session[]
  chatThreads   ChatThread[]
  files         File[]
  providers     AiProvider[]

  createdAt     DateTime       @default(now())
}

// --- INTERVIEW SESSIONS ---

model Session {
  id            Int               @id @default(autoincrement())
  userId        Int
  user          User              @relation(fields: [userId], references: [id])

  // Interview Config
  packageType   PackageType
  difficulty    Difficulty
  tutorId       Int
  tutor         Tutor             @relation(fields: [tutorId], references: [id])

  // Progress & Stats
  status        SessionStatus     @default(LIVE)
  durationSec   Int               @default(0)
  overallScore  Float?            // Nullable if abandoned/live

  // Content & Feedback
  messages      SessionMessage[]  // Live transcript
  analysis      Analysis?         // Detailed report cards
  questionLogs  QuestionFeedback[]

  videoUrl      String?           // Link to recording
  createdAt     DateTime          @default(now())
}

model Tutor {
  id            Int       @id @default(autoincrement())
  name          String    // Alex, Priya, Morgan
  avatarLabel   String    // AX, PR, MG
  specialty     String
  traits        String    // e.g., "Direct, Challenging"
  isPro         Boolean   @default(false)
  sessions      Session[]
}

// --- LIVE TRANSCRIPT & ANALYSIS ---

model SessionMessage {
  id         Int        @id @default(autoincrement())
  sessionId  Int
  session    Session    @relation(fields: [sessionId], references: [id])
  sender     SenderType
  content    String
  timestamp  DateTime   @default(now())
}

model Analysis {
  id                Int      @id @default(autoincrement())
  sessionId         Int      @unique
  session           Session  @relation(fields: [sessionId], references: [id])

  // Metrics from Analysis Cards
  communication     Float
  technical         Float
  problemSolving    Float
  confidence        Float

  strengths         String   // Stored as JSON string or newline-separated
  improvements      String   // Stored as JSON string or newline-separated
  engine            String   @default("Gemini 2.0 Flash")
}

model QuestionFeedback {
  id          Int      @id @default(autoincrement())
  sessionId   Int
  session     Session  @relation(fields: [sessionId], references: [id])

  question    String
  userAnswer  String
  aiFeedback  String
  score       Int
}

// --- AI ASSISTANT (CHAT TAB) ---

model ChatThread {
  id            Int           @id @default(autoincrement())
  userId        Int
  user          User          @relation(fields: [userId], references: [id])
  title         String        // e.g., "Behavioral session review"
  lastMessageAt DateTime      @updatedAt
  messages      AssistantMessage[]
  createdAt     DateTime      @default(now())
}

model AssistantMessage {
  id           Int        @id @default(autoincrement())
  threadId     Int
  thread       ChatThread @relation(fields: [threadId], references: [id])
  role         MessageRole
  content      String
  createdAt    DateTime   @default(now())
}

// --- SYSTEM & SETTINGS ---

model AiProvider {
  id            Int            @id @default(autoincrement())
  userId        Int
  user          User           @relation(fields: [userId], references: [id])

  name          String         // e.g., "Claude CLI"
  type          ProviderType
  priority      Int            // Order in provider chain
  status        ProviderStatus @default(INACTIVE)
  statusText    String?        // e.g., "BYOK — key configured"
  version       String?
  externalPath  String?
  apiKey        String?
}

model File {
  id         Int      @id @default(autoincrement())
  userId     Int
  user       User     @relation(fields: [userId], references: [id])
  fileName   String
  fileUrl    String?
  uploadedAt DateTime @default(now())
}

// --- ENUMS ---

enum Plan {
  FREE
  PRO
}

enum SessionStatus {
  LIVE
  COMPLETED
  ABANDONED
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
  EXPERT
}

enum PackageType {
  BEHAVIORAL
  TECHNICAL
  DSA
  HR_ROUND
  PRODUCT_MANAGER
  SYSTEM_DESIGN
}

enum SenderType {
  USER
  AI
  SYSTEM
}

enum MessageRole {
  USER
  ASSISTANT
}

enum ProviderType {
  VOICE_AGENT
  CLI
  API
  LOCAL
}

enum ProviderStatus {
  ACTIVE
  INACTIVE
  WARNING
}
```
