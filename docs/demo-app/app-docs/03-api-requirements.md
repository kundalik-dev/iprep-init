# iPrep Current API Requirements

This file lists the APIs needed by the current `demo-app-2/app.js`.

It does not describe a full future backend. It only converts the current front-end mock behavior into backend endpoints. The current app loads `mock-data.json` once, then uses `MockAPI` plus direct in-memory edits. These endpoints are the real API replacements needed now.

## Base

- Base URL: `/api`
- Response format: JSON
- Dates: ISO strings
- Scores in the current app are `0-100`
- File edits, chat messages, conversations, and sessions currently mutate memory; real APIs should persist those changes

## Current MockAPI Methods In `app.js`

Current methods:

```js
MockAPI.load()
MockAPI.getTutors()
MockAPI.getPackages()
MockAPI.getSessions()
MockAPI.getAnalysis(id)
MockAPI.getProviders()
MockAPI.getStats()
MockAPI.startSession(pkgSlug, tutorSlug)
MockAPI.endSession(id)
MockAPI.getConversations()
MockAPI.createConversation(title)
MockAPI.addMessage(convId, role, text)
```

Current direct state operations that also need APIs:

```js
State.data.fileSystem
createFile()
createFolder()
uploadFile()
saveFile()
deleteFile()
deleteFolder()
fileEditorChange()
toggleKeyVisibility()
saveAPIKeys()
savePreferences()
```

## Startup API

The current app starts by fetching one file:

```js
fetch('mock-data.json')
```

You can keep one bootstrap endpoint for the same behavior.

| Method | Endpoint | Replaces | Used By |
|---|---|---|---|
| `GET` | `/bootstrap` | `MockAPI.load()` | app boot |

Response should include the same top-level shape as `mock-data.json`:

```json
{
  "tutors": [],
  "packages": [],
  "sessions": [],
  "analysis": {},
  "providers": [],
  "stats": {},
  "transcript_demo": [],
  "conversations": [],
  "fileSystem": {}
}
```

If you build separate APIs instead of `/bootstrap`, the app will need to call each route-specific API when rendering each view.

## Dashboard APIs

Current dashboard calls:

```js
MockAPI.getSessions()
MockAPI.getStats()
```

| Method | Endpoint | Replaces | Used By |
|---|---|---|---|
| `GET` | `/sessions` | `MockAPI.getSessions()` | recent sessions |
| `GET` | `/stats` | `MockAPI.getStats()` | dashboard cards, quick stats |

`GET /stats` response must include:

```json
{
  "totalSessions": 8,
  "completedSessions": 7,
  "sessionsThisWeek": 4,
  "avgScore": 79,
  "bestCategory": "HR Round",
  "bestScore": 91,
  "studyStreakDays": 7,
  "totalMinutes": 312,
  "lifetimeCommunication": {}
}
```

## New Interview APIs

Current New Interview calls:

```js
MockAPI.getPackages()
MockAPI.getTutors()
MockAPI.startSession(State.selectedPackage.slug, State.selectedTutor.slug)
```

| Method | Endpoint | Replaces | Used By |
|---|---|---|---|
| `GET` | `/packages` | `MockAPI.getPackages()` | package selection |
| `GET` | `/tutors` | `MockAPI.getTutors()` | tutor selection |
| `POST` | `/sessions/start` | `MockAPI.startSession(pkgSlug, tutorSlug)` | Start Interview button |

`POST /sessions/start` request:

```json
{
  "packageSlug": "behavioral",
  "tutorSlug": "priya"
}
```

Current response expected by app:

```json
{
  "id": "sess_live_1710000000000",
  "packageSlug": "behavioral",
  "tutorSlug": "priya"
}
```

Recommended real response can also include:

```json
{
  "id": "sess_live_1710000000000",
  "status": "ACTIVE",
  "packageSlug": "behavioral",
  "tutorSlug": "priya",
  "startedAt": "2026-05-07T10:00:00Z"
}
```

## Live Session APIs

Current live session uses local state:

```js
State.data.transcript_demo
State.sessionTimer
State.transcriptInterval
toggleMic()
endSession()
```

Minimum APIs needed:

| Method | Endpoint | Replaces | Used By |
|---|---|---|---|
| `GET` | `/sessions/{sessionId}/demo-transcript` | `State.data.transcript_demo` | live transcript simulation |
| `PATCH` | `/sessions/{sessionId}/mic` | `toggleMic()` local state | mic state if backend needs it |
| `POST` | `/sessions/{sessionId}/end` | `MockAPI.endSession(id)` | End Session button |

`GET /sessions/{sessionId}/demo-transcript` response:

```json
[
  { "speaker": "ai", "text": "Welcome...", "ts": 0 },
  { "speaker": "user", "text": "My answer...", "ts": 8 }
]
```

`PATCH /sessions/{sessionId}/mic` request:

```json
{ "micOn": false }
```

This endpoint is optional unless the backend needs to know mic state.

`POST /sessions/{sessionId}/end` current response expected by app:

```json
{
  "analysisId": "anal_001"
}
```

The app then navigates to:

```js
navigate('analysis', { id: result.analysisId })
```

## Analysis APIs

Current Analysis view calls:

```js
MockAPI.getAnalysis(id)
State.data.sessions.find(s => s.id === analysis.sessionId)
```

| Method | Endpoint | Replaces | Used By |
|---|---|---|---|
| `GET` | `/analysis/{analysisId}` | `MockAPI.getAnalysis(id)` | Analysis Report page |
| `GET` | `/sessions/{sessionId}` | session lookup from `State.data.sessions` | analysis page subtitle/detail |

`GET /analysis/{analysisId}` response must include:

```json
{
  "id": "anal_001",
  "sessionId": "sess_001",
  "provider": "Claude",
  "status": "COMPLETED",
  "scores": {
    "communication": 84,
    "technical": 72,
    "problemSolving": 80,
    "confidence": 78,
    "overall": 86
  },
  "strengths": [],
  "improvements": [],
  "answerFeedback": [],
  "report": "## Markdown report",
  "generatedAt": "2026-05-07T10:00:00Z",
  "communicationAnalysis": {}
}
```

The Communication tab inside Analysis reads `analysis.communicationAnalysis`; no separate endpoint is required for the current app if `GET /analysis/{id}` returns it.

## History APIs

Current History view calls:

```js
MockAPI.getSessions()
renderSessionRow(s)
openHistoryPanel(sessionId, panel)
exportRecording(id)
exportTranscript(id)
handleTranscriptSearch(id, query)
```

| Method | Endpoint | Replaces | Used By |
|---|---|---|---|
| `GET` | `/sessions` | `MockAPI.getSessions()` | history list and filters |
| `GET` | `/sessions?status=COMPLETED` | local history filter | Completed filter |
| `GET` | `/sessions?status=ABANDONED` | local history filter | Abandoned filter |
| `GET` | `/sessions/{sessionId}/recording` | session recording fields | Recording panel |
| `GET` | `/sessions/{sessionId}/transcript` | `s.transcript` | Transcript panel |
| `GET` | `/sessions/{sessionId}/recording/download` | `exportRecording(id)` toast | Export Recording |
| `GET` | `/sessions/{sessionId}/transcript/download` | `exportTranscript(id)` toast | Export Transcript |

`GET /sessions` response should return session rows with fields used by `renderSessionRow`:

```json
[
  {
    "id": "sess_001",
    "packageSlug": "behavioral",
    "packageName": "Behavioral Interview",
    "tutorSlug": "priya",
    "tutorName": "Priya Sharma",
    "status": "COMPLETED",
    "startedAt": "2026-05-05T10:00:00Z",
    "durationSec": 1920,
    "score": 86,
    "analysisId": "anal_001",
    "hasRecording": true,
    "recordingDurationSec": 1920,
    "transcript": []
  }
]
```

Note: the current UI can work with transcript embedded in `/sessions`, but a real app should load transcript on demand with `/sessions/{id}/transcript`.

## AI Chat APIs

Current Chat view calls:

```js
MockAPI.getConversations()
MockAPI.createConversation(title)
MockAPI.addMessage(convId, 'user', text)
getAIResponse(text)
MockAPI.addMessage(convId, 'ai', aiText.text)
```

The current AI response is generated in the browser by `getAIResponse(userText)`. A real backend should replace that function.

| Method | Endpoint | Replaces | Used By |
|---|---|---|---|
| `GET` | `/conversations` | `MockAPI.getConversations()` | chat sidebar |
| `POST` | `/conversations` | `MockAPI.createConversation(title)` | New Chat button |
| `GET` | `/conversations/{conversationId}` | active conversation lookup | message history |
| `POST` | `/conversations/{conversationId}/messages` | user `addMessage` + `getAIResponse` + AI `addMessage` | Send message |

`POST /conversations` request:

```json
{
  "title": "New Chat - 10:30 AM"
}
```

Response:

```json
{
  "id": "conv_001",
  "title": "New Chat - 10:30 AM",
  "createdAt": "2026-05-07T10:30:00Z",
  "updatedAt": "2026-05-07T10:30:00Z",
  "messages": [
    {
      "id": "msg_001",
      "role": "ai",
      "text": "Hey! I'm your AI interview coach...",
      "ts": "2026-05-07T10:30:00Z",
      "actions": []
    }
  ]
}
```

`POST /conversations/{conversationId}/messages` request:

```json
{
  "text": "How did I do in my last session?"
}
```

Response should include both saved user message and generated AI message because the current app expects the UI to update after a delayed AI answer:

```json
{
  "userMessage": {
    "id": "msg_002",
    "role": "user",
    "text": "How did I do in my last session?",
    "ts": "2026-05-07T10:31:00Z",
    "actions": []
  },
  "aiMessage": {
    "id": "msg_003",
    "role": "ai",
    "text": "Your most recent session was Behavioral Interview...",
    "ts": "2026-05-07T10:31:02Z",
    "actions": [
      { "label": "View Full Analysis", "view": "analysis", "params": { "id": "anal_001" } }
    ]
  }
}
```

Backend AI response must support the same topics currently handled by `getAIResponse()`:

- last/recent session review
- improvement plan
- stats/progress overview
- DSA coaching
- behavioral coaching
- system design coaching
- HR coaching
- tutor-specific questions for Alex, Priya, Morgan
- communication/filler word feedback
- sentence rewrite requests
- notes/files context questions
- practice question requests
- fallback general coach response

## Notes And Files APIs

Current Files view does not use `MockAPI`; it directly reads and mutates:

```js
State.data.fileSystem
State.data.fileSystem.folders
State.data.fileSystem.rootFiles
```

Current file actions:

```js
createFile()
createFolder()
uploadFile()
saveFile(id)
deleteFile(id)
deleteFolder(id)
fileEditorChange(id, value)
selectFile(id)
toggleFolder(id)
switchEditorMode(mode)
```

Only the actions that change/load data need APIs.

| Method | Endpoint | Replaces | Used By |
|---|---|---|---|
| `GET` | `/file-system` | `State.data.fileSystem` | Files view initial render |
| `GET` | `/files/{fileId}` | `findFile(id)` | file selection/editor |
| `POST` | `/files` | `createFile()` | New markdown note |
| `PATCH` | `/files/{fileId}` | `saveFile(id)` and autosave from `fileEditorChange()` | editor save/autosave |
| `DELETE` | `/files/{fileId}` | `deleteFile(id)` | Delete file button |
| `POST` | `/folders` | `createFolder()` | New folder |
| `DELETE` | `/folders/{folderId}` | `deleteFolder(id)` | Delete folder |
| `POST` | `/uploads` | `uploadFile()` | Upload `.md`, `.pdf`, `.docx` |
| `GET` | `/files/{fileId}/download` | simulated download button for PDF/DOCX | Download |

`GET /file-system` response:

```json
{
  "storageRoot": "~/.iprep/uploads/",
  "folders": [],
  "rootFiles": []
}
```

`POST /files` request:

```json
{
  "name": "new-note.md",
  "type": "md",
  "folderId": null,
  "content": "# New Note\n\n"
}
```

`PATCH /files/{fileId}` request:

```json
{
  "content": "# Updated Note\n\nText from textarea."
}
```

`POST /folders` request:

```json
{
  "name": "Interview Notes"
}
```

`POST /uploads` request:

- Content type: `multipart/form-data`
- Field: `file`
- Accepted extensions in the current UI: `.md`, `.pdf`, `.docx`

Upload response:

```json
{
  "id": "file_123",
  "name": "resume.pdf",
  "type": "pdf",
  "sizeKB": 184,
  "createdAt": "2026-05-07T10:00:00Z",
  "updatedAt": "2026-05-07T10:00:00Z",
  "folderId": null,
  "content": null
}
```

## Communication Coach APIs

Current Communication view calls:

```js
MockAPI.getStats()
stats.lifetimeCommunication
State.data.sessions.find(...)
State.data.analysis.anal_001.communicationAnalysis
```

| Method | Endpoint | Replaces | Used By |
|---|---|---|---|
| `GET` | `/stats` | `MockAPI.getStats()` | communication overview |
| `GET` | `/communication` | `stats.lifetimeCommunication` | optional focused endpoint |
| `GET` | `/analysis/{analysisId}` | `State.data.analysis.anal_001.communicationAnalysis` | replacement examples and sentence rewrites |

For the current app, `GET /stats` must include `lifetimeCommunication`:

```json
{
  "lifetimeCommunication": {
    "avgCommunicationScore": 76,
    "totalFillerWordsAllTime": 187,
    "topFillerAllTime": "like",
    "improvementTrend": "+12%",
    "mostImprovedArea": "Reduced filler words",
    "nextFocusArea": "Pause before answering",
    "allTimeFillerStats": [],
    "recentSessionScores": []
  }
}
```

The current UI also reads communication replacements and rewrites from:

```js
State.data.analysis.anal_001.communicationAnalysis.topReplacements
State.data.analysis.anal_001.communicationAnalysis.sentenceRewrites
```

So either:

1. Keep those inside `GET /analysis/anal_001`, or
2. Add `GET /communication/examples`.

If adding the focused endpoint:

| Method | Endpoint | Replaces | Used By |
|---|---|---|---|
| `GET` | `/communication/examples` | `analysis.anal_001.communicationAnalysis.topReplacements` and `sentenceRewrites` | Communication Coach right column |

## Settings APIs

Current Settings view calls:

```js
MockAPI.getProviders()
saveAPIKeys()
savePreferences()
toggleKeyVisibility()
```

`toggleKeyVisibility()` is UI-only and does not need an API.

| Method | Endpoint | Replaces | Used By |
|---|---|---|---|
| `GET` | `/providers` | `MockAPI.getProviders()` | Providers tab |
| `POST` | `/settings/api-keys` | `saveAPIKeys()` | API Keys tab |
| `PATCH` | `/settings/preferences` | `savePreferences()` | Preferences tab |

`GET /providers` response:

```json
[
  {
    "key": "deepgram",
    "name": "Deepgram",
    "type": "Speech-to-Text",
    "status": "active",
    "version": "v1",
    "note": "Configured",
    "installHint": null
  }
]
```

`POST /settings/api-keys` request:

```json
{
  "deepgram": "dg_...",
  "anthropic": "sk-ant-...",
  "gemini": "AIza...",
  "openai": "sk-..."
}
```

Do not return raw keys. Return only saved state:

```json
{
  "saved": true,
  "providers": {
    "deepgram": { "hasKey": true },
    "anthropic": { "hasKey": true },
    "gemini": { "hasKey": false },
    "openai": { "hasKey": false }
  }
}
```

`PATCH /settings/preferences` request:

```json
{
  "defaultTutorSlug": "priya",
  "defaultPackageSlug": "behavioral",
  "voiceMode": true,
  "autoAnalyzeOnEnd": true,
  "theme": "dark"
}
```

## Exact Endpoint List Needed Now

Build these first:

```txt
GET    /api/bootstrap

GET    /api/stats
GET    /api/tutors
GET    /api/packages
GET    /api/providers

GET    /api/sessions
GET    /api/sessions?status=COMPLETED
GET    /api/sessions?status=ABANDONED
GET    /api/sessions/{sessionId}
POST   /api/sessions/start
GET    /api/sessions/{sessionId}/demo-transcript
PATCH  /api/sessions/{sessionId}/mic
POST   /api/sessions/{sessionId}/end
GET    /api/sessions/{sessionId}/recording
GET    /api/sessions/{sessionId}/transcript
GET    /api/sessions/{sessionId}/recording/download
GET    /api/sessions/{sessionId}/transcript/download

GET    /api/analysis/{analysisId}

GET    /api/conversations
POST   /api/conversations
GET    /api/conversations/{conversationId}
POST   /api/conversations/{conversationId}/messages

GET    /api/file-system
GET    /api/files/{fileId}
POST   /api/files
PATCH  /api/files/{fileId}
DELETE /api/files/{fileId}
POST   /api/folders
DELETE /api/folders/{folderId}
POST   /api/uploads
GET    /api/files/{fileId}/download

GET    /api/communication
GET    /api/communication/examples

POST   /api/settings/api-keys
PATCH  /api/settings/preferences
```

## Priority Order Matching Current App

1. `GET /api/bootstrap`
2. `GET /api/sessions`, `GET /api/stats`
3. `GET /api/packages`, `GET /api/tutors`, `POST /api/sessions/start`, `POST /api/sessions/{id}/end`
4. `GET /api/analysis/{id}`
5. Chat endpoints
6. File-system endpoints
7. Communication endpoints
8. Provider and settings endpoints

## What Is Not Needed By Current `app.js`

These are not required by the current implementation:

- Login/logout APIs
- Billing APIs
- Pro subscription enforcement APIs
- Real audio streaming APIs
- WebSocket APIs
- Real speech-to-text APIs
- Separate analysis job status API
- Separate tutor/package detail APIs

They can be added later, but the current `demo-app-2/app.js` does not call for them.
