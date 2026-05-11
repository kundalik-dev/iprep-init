---
name: iPrep API Requirements
description: Future-facing API requirements for the local iPrep server based on brainstorming notes and demo app API requirements.
---

# iPrep API Requirements

This document defines the API surface needed for the real iPrep local server. It combines the current demo API behavior from [`docs/demo-app/app-docs/03-api-requirements.md`](../demo-app/app-docs/03-api-requirements.md) with the newer brainstorming docs in [`docs/brain-storming/`](./).

The API should support the hosted or bundled frontend while keeping all user data local in the user's `.iprep` workspace.

## Base

- Base URL in local development: `http://localhost:5545`
- API prefix: `/api/v1`
- Response format: JSON unless the endpoint is an export/download
- Dates: ISO 8601 strings
- Scores: `0-100` unless a field explicitly says it is `0-10`
- Storage: local SQLite database plus files under `~/.iprep/`
- Auth: not required for the first local-only version
- Sensitive values: never return raw API keys in responses

## Standard Response Shapes

Successful object response:

```json
{
  "data": {},
  "meta": {}
}
```

Successful list response:

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "pageSize": 20
  }
}
```

Error response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "A readable error message.",
    "details": {}
  }
}
```

## Core Entities

| Entity           | Purpose                                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| User             | Local user profile, goal, preferences, and onboarding state.                                                |
| Provider         | AI, voice, and local tool providers such as Claude, Gemini, OpenAI, Deepgram, Ollama, and OpenRouter.       |
| Document         | Uploaded resume, notes, PDFs, job descriptions, and Markdown context files.                                 |
| InterviewPackage | Ready-made interview template such as Behavioral, HR, DSA, Technical, System Design, or Automation Testing. |
| Tutor            | AI tutor profile such as direct, supportive, strict, technical, or strategic.                               |
| Interview        | One interview session, including setup, status, transcript, recording, and analysis links.                  |
| Analysis         | Post-session report with scores, feedback, communication analysis, and recommendations.                     |
| Conversation     | AI Coach chat thread and generated interview setup discussion.                                              |
| Communication    | Cross-session communication metrics, filler word trends, and improvement plans.                             |
| Export           | Downloadable transcript, analysis report, recording, or backup bundle.                                      |

## Health And Bootstrap APIs

| Method | Endpoint               | Purpose                                                                |
| ------ | ---------------------- | ---------------------------------------------------------------------- |
| `GET`  | `/api/v1/health`       | Server health check.                                                   |
| `GET`  | `/api/v1/bootstrap`    | Load initial app data after the frontend connects to the local server. |
| `GET`  | `/api/v1/local/status` | Return local workspace, database, provider, and server status.         |

### GET /api/v1/health

Response:

```json
{
  "data": {
    "status": "ok",
    "service": "iprep-server",
    "version": "0.1.0",
    "checkedAt": "2026-05-11T12:00:00.000Z"
  }
}
```

### GET /api/v1/bootstrap

Use this to replace the demo app's `mock-data.json` startup behavior.

Response:

```json
{
  "data": {
    "user": {},
    "stats": {},
    "packages": [],
    "tutors": [],
    "recentInterviews": [],
    "providers": [],
    "communication": {},
    "onboarding": {
      "isComplete": false,
      "missingSteps": ["profile", "provider", "voice"]
    }
  }
}
```

### GET /api/v1/local/status

Response:

```json
{
  "data": {
    "workspacePath": "C:\\Users\\<username>\\.iprep",
    "databasePath": "C:\\Users\\<username>\\.iprep\\database\\iprep.db",
    "serverPort": 5545,
    "databaseReady": true,
    "configReady": true,
    "providersConfigured": ["claude", "deepgram"],
    "missingSetup": ["resume"]
  }
}
```

## Onboarding And Profile APIs

| Method  | Endpoint                      | Purpose                                              |
| ------- | ----------------------------- | ---------------------------------------------------- |
| `GET`   | `/api/v1/onboarding`          | Read onboarding progress.                            |
| `POST`  | `/api/v1/onboarding/profile`  | Save name and email.                                 |
| `POST`  | `/api/v1/onboarding/goal`     | Save preparation goal and optional resume reference. |
| `POST`  | `/api/v1/onboarding/provider` | Save first AI provider selection and key metadata.   |
| `POST`  | `/api/v1/onboarding/complete` | Mark onboarding complete after required steps pass.  |
| `GET`   | `/api/v1/user`                | Read local user profile.                             |
| `PATCH` | `/api/v1/user`                | Update local user profile.                           |

### POST /api/v1/onboarding/profile

Request:

```json
{
  "name": "Kundalik",
  "email": "kundalik@example.com"
}
```

Response:

```json
{
  "data": {
    "id": "user_001",
    "name": "Kundalik",
    "email": "kundalik@example.com",
    "onboardingStep": "goal"
  }
}
```

### POST /api/v1/onboarding/goal

Request:

```json
{
  "goal": "Prepare for Java backend interviews",
  "resumeDocumentId": "doc_resume_001"
}
```

### POST /api/v1/onboarding/provider

Request:

```json
{
  "provider": "claude",
  "apiKey": "replace-with-local-test-key",
  "makeDefault": true
}
```

Response:

```json
{
  "data": {
    "provider": "claude",
    "hasKey": true,
    "status": "configured",
    "isDefault": true
  }
}
```

## Dashboard APIs

| Method | Endpoint                        | Purpose                                             |
| ------ | ------------------------------- | --------------------------------------------------- |
| `GET`  | `/api/v1/dashboard`             | Get dashboard overview in one request.              |
| `GET`  | `/api/v1/stats`                 | Get summary stats and lifetime communication stats. |
| `GET`  | `/api/v1/leaderboard/anonymous` | Optional anonymous score comparison.                |

### GET /api/v1/dashboard

Response:

```json
{
  "data": {
    "quickStats": {
      "totalSessions": 8,
      "completedSessions": 7,
      "avgScore": 79,
      "studyStreakDays": 7,
      "totalMinutes": 312
    },
    "practiceTip": "Pause for one second before answering behavioral questions.",
    "nextTopic": "STAR method with measurable outcomes",
    "recentSessions": [],
    "setupActions": []
  }
}
```

## Packages And Tutors APIs

| Method | Endpoint                       | Purpose                              |
| ------ | ------------------------------ | ------------------------------------ |
| `GET`  | `/api/v1/packages`             | List ready-made interview templates. |
| `GET`  | `/api/v1/packages/{packageId}` | Read one interview package.          |
| `GET`  | `/api/v1/tutors`               | List AI tutor profiles.              |
| `GET`  | `/api/v1/tutors/{tutorId}`     | Read one tutor profile.              |

### GET /api/v1/packages

Response:

```json
{
  "data": [
    {
      "id": "pkg_behavioral",
      "slug": "behavioral",
      "name": "Behavioral Interview",
      "type": "BEHAVIORAL",
      "difficulty": "MEDIUM",
      "durationMin": 25,
      "questionCount": 8,
      "topics": ["STAR method", "leadership", "conflict"],
      "isPro": false
    }
  ]
}
```

## Interview APIs

Use `interviews` as the canonical resource name. It maps to the product language "interview session" and the database `Interview` model.

| Method   | Endpoint                                  | Purpose                                                                |
| -------- | ----------------------------------------- | ---------------------------------------------------------------------- |
| `GET`    | `/api/v1/interviews`                      | List interview sessions for dashboard and history.                     |
| `POST`   | `/api/v1/interviews`                      | Create a draft or active interview from a template or AI-guided setup. |
| `GET`    | `/api/v1/interviews/{interviewId}`        | Read one interview session.                                            |
| `PATCH`  | `/api/v1/interviews/{interviewId}`        | Update draft interview setup before starting.                          |
| `POST`   | `/api/v1/interviews/{interviewId}/start`  | Start a draft interview.                                               |
| `POST`   | `/api/v1/interviews/{interviewId}/end`    | End an active interview and trigger post-session jobs.                 |
| `POST`   | `/api/v1/interviews/{interviewId}/cancel` | Cancel or abandon an interview.                                        |
| `DELETE` | `/api/v1/interviews/{interviewId}`        | Delete a local interview session.                                      |

### GET /api/v1/interviews

Supported query params:

- `status`: `DRAFT`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `ABANDONED`
- `type`: `BEHAVIORAL`, `HR`, `TECHNICAL`, `COMMUNICATION`, `DSA`, `SYSTEM_DESIGN`, `AUTOMATION_TESTING`
- `mode`: `CHAT`, `VOICE`, `PRESENTATION`
- `q`: search by package, tutor, notes, or transcript text
- `page`, `pageSize`

Response:

```json
{
  "data": [
    {
      "id": "int_001",
      "packageSlug": "behavioral",
      "packageName": "Behavioral Interview",
      "tutorSlug": "priya",
      "tutorName": "Priya",
      "status": "COMPLETED",
      "mode": "VOICE",
      "startedAt": "2026-05-11T10:00:00.000Z",
      "endedAt": "2026-05-11T10:25:00.000Z",
      "durationSec": 1500,
      "score": 86,
      "analysisId": "analysis_001",
      "hasRecording": true,
      "hasTranscript": true
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

### POST /api/v1/interviews

Request for a ready-made template:

```json
{
  "source": "template",
  "packageSlug": "behavioral",
  "difficulty": "MEDIUM",
  "durationMin": 25,
  "mode": "VOICE",
  "tutorSlug": "priya",
  "contextDocumentIds": ["doc_resume_001", "doc_notes_001"],
  "customQuestions": ["Tell me about a time you handled conflict."]
}
```

Request for AI-guided setup:

```json
{
  "source": "ai-guided",
  "conversationId": "conv_001",
  "generatedPlan": {
    "type": "SYSTEM_DESIGN",
    "difficulty": "HARD",
    "durationMin": 30,
    "mode": "CHAT",
    "topics": ["rate limiting", "cache invalidation", "observability"]
  }
}
```

Response:

```json
{
  "data": {
    "id": "int_123",
    "status": "DRAFT",
    "mode": "VOICE",
    "packageSlug": "behavioral",
    "tutorSlug": "priya",
    "createdAt": "2026-05-11T10:00:00.000Z"
  }
}
```

### POST /api/v1/interviews/{interviewId}/end

Request:

```json
{
  "endedReason": "user_completed",
  "autoAnalyze": true
}
```

Response:

```json
{
  "data": {
    "id": "int_123",
    "status": "COMPLETED",
    "endedAt": "2026-05-11T10:25:00.000Z",
    "analysisJobId": "job_analysis_123"
  }
}
```

## Transcript And Recording APIs

| Method | Endpoint                                               | Purpose                            |
| ------ | ------------------------------------------------------ | ---------------------------------- |
| `GET`  | `/api/v1/interviews/{interviewId}/transcript`          | Read transcript turns.             |
| `POST` | `/api/v1/interviews/{interviewId}/transcript`          | Append or import transcript turns. |
| `GET`  | `/api/v1/interviews/{interviewId}/recording`           | Read recording metadata.           |
| `GET`  | `/api/v1/interviews/{interviewId}/recording/download`  | Download recording file.           |
| `GET`  | `/api/v1/interviews/{interviewId}/transcript/download` | Download transcript export.        |

### GET /api/v1/interviews/{interviewId}/transcript

Response:

```json
{
  "data": [
    {
      "id": "turn_001",
      "speaker": "ai",
      "speakerName": "Priya",
      "text": "Tell me about a time you led a team.",
      "timestampSec": 12,
      "createdAt": "2026-05-11T10:00:12.000Z"
    }
  ]
}
```

## Analysis APIs

| Method | Endpoint                                    | Purpose                                               |
| ------ | ------------------------------------------- | ----------------------------------------------------- |
| `POST` | `/api/v1/interviews/{interviewId}/analysis` | Trigger or re-run analysis for a completed interview. |
| `GET`  | `/api/v1/analysis/{analysisId}`             | Read one analysis report by analysis id.              |
| `GET`  | `/api/v1/interviews/{interviewId}/analysis` | Read the latest analysis for an interview.            |
| `GET`  | `/api/v1/analysis/{analysisId}/download`    | Download Markdown analysis report.                    |

### GET /api/v1/analysis/{analysisId}

Response:

```json
{
  "data": {
    "id": "analysis_001",
    "interviewId": "int_001",
    "provider": "claude",
    "status": "COMPLETED",
    "scores": {
      "communication": 84,
      "technical": 72,
      "problemSolving": 80,
      "confidence": 78,
      "overall": 86
    },
    "strengths": ["Clear examples", "Good structure"],
    "improvements": ["Add metrics", "Reduce filler words"],
    "answerFeedback": [],
    "communicationAnalysis": {},
    "reportMarkdown": "## Interview Analysis\n\n...",
    "generatedAt": "2026-05-11T10:30:00.000Z"
  }
}
```

## History APIs

History can use `GET /api/v1/interviews`, transcript, recording, and analysis endpoints. A focused history endpoint is optional if the UI wants one optimized payload.

| Method | Endpoint                 | Purpose                                                  |
| ------ | ------------------------ | -------------------------------------------------------- |
| `GET`  | `/api/v1/history`        | Optional optimized history list.                         |
| `GET`  | `/api/v1/history/search` | Optional search across sessions, transcripts, and notes. |

### GET /api/v1/history/search?q=cache

Response:

```json
{
  "data": {
    "interviews": [],
    "transcriptTurns": [],
    "documents": []
  }
}
```

## AI Coach APIs

| Method   | Endpoint                                                | Purpose                                                     |
| -------- | ------------------------------------------------------- | ----------------------------------------------------------- |
| `GET`    | `/api/v1/conversations`                                 | List AI Coach conversations.                                |
| `POST`   | `/api/v1/conversations`                                 | Create a new conversation.                                  |
| `GET`    | `/api/v1/conversations/{conversationId}`                | Read one conversation with messages.                        |
| `PATCH`  | `/api/v1/conversations/{conversationId}`                | Rename or archive a conversation.                           |
| `DELETE` | `/api/v1/conversations/{conversationId}`                | Delete a conversation.                                      |
| `POST`   | `/api/v1/conversations/{conversationId}/messages`       | Add a user message and return AI response.                  |
| `POST`   | `/api/v1/conversations/{conversationId}/interview-plan` | Convert an AI-guided chat into a structured interview plan. |

### POST /api/v1/conversations/{conversationId}/messages

Request:

```json
{
  "text": "Create a 25 minute behavioral interview using my resume.",
  "contextDocumentIds": ["doc_resume_001"]
}
```

Response:

```json
{
  "data": {
    "userMessage": {
      "id": "msg_001",
      "role": "user",
      "text": "Create a 25 minute behavioral interview using my resume.",
      "createdAt": "2026-05-11T10:00:00.000Z"
    },
    "aiMessage": {
      "id": "msg_002",
      "role": "assistant",
      "text": "Great. I will focus on leadership, conflict, and project ownership.",
      "actions": [
        {
          "label": "Review Interview Plan",
          "view": "new-interview",
          "params": {
            "planId": "plan_001"
          }
        }
      ],
      "createdAt": "2026-05-11T10:00:02.000Z"
    }
  }
}
```

### POST /api/v1/conversations/{conversationId}/interview-plan

Response:

```json
{
  "data": {
    "id": "plan_001",
    "type": "BEHAVIORAL",
    "difficulty": "MEDIUM",
    "durationMin": 25,
    "mode": "VOICE",
    "tutorStyle": "supportive",
    "topics": ["leadership", "conflict", "ownership"],
    "questionPlan": []
  }
}
```

## Notes, Files, And Context APIs

The real app should store user documents under `~/.iprep/docs/<document-id>/` and convert supported files to Markdown for AI context.

| Method   | Endpoint                                  | Purpose                                             |
| -------- | ----------------------------------------- | --------------------------------------------------- |
| `GET`    | `/api/v1/documents`                       | List uploaded documents and Markdown notes.         |
| `POST`   | `/api/v1/documents`                       | Create a Markdown note.                             |
| `POST`   | `/api/v1/documents/upload`                | Upload resume, notes, PDF, DOCX, or Markdown.       |
| `GET`    | `/api/v1/documents/{documentId}`          | Read document metadata and Markdown content.        |
| `PATCH`  | `/api/v1/documents/{documentId}`          | Update title, tags, folder, or Markdown content.    |
| `DELETE` | `/api/v1/documents/{documentId}`          | Delete a document.                                  |
| `POST`   | `/api/v1/documents/{documentId}/convert`  | Convert original file to Markdown.                  |
| `POST`   | `/api/v1/documents/{documentId}/optimize` | Ask AI to improve notes or identify missing topics. |
| `GET`    | `/api/v1/documents/{documentId}/download` | Download original or Markdown document.             |
| `GET`    | `/api/v1/folders`                         | List document folders.                              |
| `POST`   | `/api/v1/folders`                         | Create a document folder.                           |
| `PATCH`  | `/api/v1/folders/{folderId}`              | Rename or move a folder.                            |
| `DELETE` | `/api/v1/folders/{folderId}`              | Delete a folder.                                    |

### POST /api/v1/documents

Request:

```json
{
  "title": "Behavioral prep notes",
  "type": "md",
  "folderId": "folder_001",
  "contentMarkdown": "# STAR Stories\n\n..."
}
```

### POST /api/v1/documents/upload

- Content type: `multipart/form-data`
- Field: `file`
- Optional fields: `folderId`, `tags`, `convertToMarkdown`
- Supported first-version extensions: `.md`, `.pdf`, `.docx`

Response:

```json
{
  "data": {
    "id": "doc_resume_001",
    "title": "resume.pdf",
    "type": "pdf",
    "folderId": null,
    "originalPath": "~/.iprep/docs/doc_resume_001/original.pdf",
    "markdownPath": "~/.iprep/docs/doc_resume_001/content.md",
    "conversionStatus": "queued",
    "createdAt": "2026-05-11T10:00:00.000Z"
  }
}
```

## Communication APIs

| Method | Endpoint                                         | Purpose                                    |
| ------ | ------------------------------------------------ | ------------------------------------------ |
| `GET`  | `/api/v1/communication`                          | Cross-session communication overview.      |
| `GET`  | `/api/v1/communication/examples`                 | Common replacements and sentence rewrites. |
| `GET`  | `/api/v1/communication/sessions`                 | Recent session communication scores.       |
| `GET`  | `/api/v1/interviews/{interviewId}/communication` | Communication analysis for one interview.  |

### GET /api/v1/communication

Response:

```json
{
  "data": {
    "avgCommunicationScore": 76,
    "totalFillerWordsAllTime": 187,
    "topFillerAllTime": "like",
    "mostImprovedArea": "Reduced filler words",
    "nextFocusArea": "Pause before answering",
    "allTimeFillerStats": [],
    "recentSessionScores": []
  }
}
```

## Provider And Settings APIs

| Method   | Endpoint                               | Purpose                                          |
| -------- | -------------------------------------- | ------------------------------------------------ |
| `GET`    | `/api/v1/providers`                    | List provider status and configuration metadata. |
| `POST`   | `/api/v1/providers/validate`           | Validate an API key or local provider setup.     |
| `POST`   | `/api/v1/providers/{providerKey}/keys` | Save or replace one provider key.                |
| `DELETE` | `/api/v1/providers/{providerKey}/keys` | Remove one provider key.                         |
| `GET`    | `/api/v1/settings`                     | Read app settings.                               |
| `PATCH`  | `/api/v1/settings`                     | Update app settings and preferences.             |

### GET /api/v1/providers

Response:

```json
{
  "data": [
    {
      "key": "deepgram",
      "name": "Deepgram",
      "type": "speech-to-text",
      "status": "configured",
      "hasKey": true,
      "version": "v1",
      "note": "Used for voice transcription."
    }
  ]
}
```

### PATCH /api/v1/settings

Request:

```json
{
  "defaultTutorSlug": "priya",
  "defaultPackageSlug": "behavioral",
  "voiceMode": true,
  "autoAnalyzeOnEnd": true,
  "theme": "dark",
  "serverPort": 5545
}
```

## Export And Backup APIs

| Method | Endpoint                                   | Purpose                             |
| ------ | ------------------------------------------ | ----------------------------------- |
| `POST` | `/api/v1/exports/interviews/{interviewId}` | Create an export for one interview. |
| `GET`  | `/api/v1/exports/{exportId}/download`      | Download an export file.            |
| `POST` | `/api/v1/backups`                          | Create a local backup archive.      |
| `GET`  | `/api/v1/backups`                          | List backup archives.               |
| `GET`  | `/api/v1/backups/{backupId}/download`      | Download a backup archive.          |

## Exact Endpoint List

Build these first:

```txt
GET    /api/v1/health
GET    /api/v1/bootstrap
GET    /api/v1/local/status

GET    /api/v1/onboarding
POST   /api/v1/onboarding/profile
POST   /api/v1/onboarding/goal
POST   /api/v1/onboarding/provider
POST   /api/v1/onboarding/complete
GET    /api/v1/user
PATCH  /api/v1/user

GET    /api/v1/dashboard
GET    /api/v1/stats

GET    /api/v1/packages
GET    /api/v1/packages/{packageId}
GET    /api/v1/tutors
GET    /api/v1/tutors/{tutorId}

GET    /api/v1/interviews
POST   /api/v1/interviews
GET    /api/v1/interviews/{interviewId}
PATCH  /api/v1/interviews/{interviewId}
POST   /api/v1/interviews/{interviewId}/start
POST   /api/v1/interviews/{interviewId}/end
POST   /api/v1/interviews/{interviewId}/cancel
DELETE /api/v1/interviews/{interviewId}

GET    /api/v1/interviews/{interviewId}/transcript
POST   /api/v1/interviews/{interviewId}/transcript
GET    /api/v1/interviews/{interviewId}/recording
GET    /api/v1/interviews/{interviewId}/recording/download
GET    /api/v1/interviews/{interviewId}/transcript/download

POST   /api/v1/interviews/{interviewId}/analysis
GET    /api/v1/interviews/{interviewId}/analysis
GET    /api/v1/analysis/{analysisId}
GET    /api/v1/analysis/{analysisId}/download

GET    /api/v1/history
GET    /api/v1/history/search

GET    /api/v1/conversations
POST   /api/v1/conversations
GET    /api/v1/conversations/{conversationId}
PATCH  /api/v1/conversations/{conversationId}
DELETE /api/v1/conversations/{conversationId}
POST   /api/v1/conversations/{conversationId}/messages
POST   /api/v1/conversations/{conversationId}/interview-plan

GET    /api/v1/documents
POST   /api/v1/documents
POST   /api/v1/documents/upload
GET    /api/v1/documents/{documentId}
PATCH  /api/v1/documents/{documentId}
DELETE /api/v1/documents/{documentId}
POST   /api/v1/documents/{documentId}/convert
POST   /api/v1/documents/{documentId}/optimize
GET    /api/v1/documents/{documentId}/download
GET    /api/v1/folders
POST   /api/v1/folders
PATCH  /api/v1/folders/{folderId}
DELETE /api/v1/folders/{folderId}

GET    /api/v1/communication
GET    /api/v1/communication/examples
GET    /api/v1/communication/sessions
GET    /api/v1/interviews/{interviewId}/communication

GET    /api/v1/providers
POST   /api/v1/providers/validate
POST   /api/v1/providers/{providerKey}/keys
DELETE /api/v1/providers/{providerKey}/keys
GET    /api/v1/settings
PATCH  /api/v1/settings

POST   /api/v1/exports/interviews/{interviewId}
GET    /api/v1/exports/{exportId}/download
POST   /api/v1/backups
GET    /api/v1/backups
GET    /api/v1/backups/{backupId}/download
```

## Priority Order

1. Health, bootstrap, and local status
2. Onboarding, user profile, providers, and settings
3. Dashboard, packages, tutors, and stats
4. Interview create/start/end, transcript, and analysis
5. History, recording, transcript download, and analysis download
6. Documents, uploads, folders, and Markdown editing
7. AI Coach conversations and AI-guided interview plan generation
8. Communication overview and examples
9. Export and backup endpoints

## First-Version Non-Goals

These are not required for the first local API:

- Login/logout
- Cloud account sync
- Billing or paid subscription enforcement
- Real-time WebSocket streaming
- Live browser audio streaming API
- Production-grade cloud storage
- Team or organization accounts
- Public sharing links
